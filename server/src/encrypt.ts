/**
 * Local AES-256-GCM for messenger PII originals.
 *
 * Tokenized sheets (PERSON_n, EMAIL_n, …) go to the model.
 * Original strings are encrypted at rest on this PC only:
 *   %LOCALAPPDATA%\cool_lin\pii.key
 *   %LOCALAPPDATA%\cool_lin\pii-map.json
 *
 * The key is never logged and never sent to Ollama or HTTP.
 * Override the directory with COOL_LIN_PII_DIR (tests).
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

const KEY_BYTES = 32;
const IV_BYTES = 12;
const KEY_FILE = "pii.key";
const MAP_FILE = "pii-map.json";

export type EncryptedBlob = {
  iv: string;
  ciphertext: string;
  tag: string;
};

export type EncryptedPiiMap = Record<string, EncryptedBlob>;

export function piiDir(): string {
  const override = process.env.COOL_LIN_PII_DIR?.trim();
  if (override) return path.resolve(override);
  if (process.platform === "win32") {
    const base = process.env.LOCALAPPDATA?.trim() || path.join(os.homedir(), "AppData", "Local");
    return path.join(base, "cool_lin");
  }
  const base = process.env.XDG_DATA_HOME?.trim() || path.join(os.homedir(), ".local", "share");
  return path.join(base, "cool_lin");
}

export function piiKeyPath(): string {
  return path.join(piiDir(), KEY_FILE);
}

export function piiMapPath(): string {
  return path.join(piiDir(), MAP_FILE);
}

function ensurePiiDir(): string {
  const dir = piiDir();
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    chmodSync(dir, 0o700);
  } catch {
    /* Windows ignores Unix modes */
  }
  return dir;
}

function atomicWrite(filePath: string, data: string | Buffer, mode = 0o600): void {
  const tmp = `${filePath}.${process.pid}.tmp`;
  writeFileSync(tmp, data, { mode });
  try {
    renameSync(tmp, filePath);
  } catch {
    writeFileSync(filePath, data, { mode });
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
  try {
    chmodSync(filePath, mode);
  } catch {
    /* Windows ignores Unix modes */
  }
}

/** Load the 32-byte key, generating it once if missing. Never log the bytes. */
export function loadOrCreateKey(): Buffer {
  ensurePiiDir();
  const keyPath = piiKeyPath();
  if (existsSync(keyPath)) {
    const buf = readFileSync(keyPath);
    if (buf.length !== KEY_BYTES) {
      throw new Error("local PII key file is the wrong size");
    }
    return buf;
  }
  const key = randomBytes(KEY_BYTES);
  atomicWrite(keyPath, key, 0o600);
  return key;
}

export function encryptString(plaintext: string, key: Buffer): EncryptedBlob {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptString(blob: EncryptedBlob, key: Buffer): string {
  if (!blob || typeof blob.iv !== "string" || typeof blob.ciphertext !== "string" || typeof blob.tag !== "string") {
    throw new Error("invalid encrypted PII blob");
  }
  const iv = Buffer.from(blob.iv, "base64");
  const ciphertext = Buffer.from(blob.ciphertext, "base64");
  const tag = Buffer.from(blob.tag, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function isBlob(v: unknown): v is EncryptedBlob {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return typeof o.iv === "string" && typeof o.ciphertext === "string" && typeof o.tag === "string";
}

export function loadEncryptedPiiMap(): EncryptedPiiMap {
  const mapPath = piiMapPath();
  if (!existsSync(mapPath)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(mapPath, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: EncryptedPiiMap = {};
    for (const [token, blob] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof token === "string" && token && isBlob(blob)) out[token] = blob;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Encrypt pii_map originals and merge into pii-map.json.
 * Existing tokens not in this batch are kept. Matching tokens are updated.
 */
export function persistEncryptedPiiMap(piiMap: Record<string, string>): EncryptedPiiMap {
  const entries = Object.entries(piiMap).filter(([, original]) => original != null && String(original).length > 0);
  if (entries.length === 0) return loadEncryptedPiiMap();

  const key = loadOrCreateKey();
  const next: EncryptedPiiMap = { ...loadEncryptedPiiMap() };
  for (const [token, original] of entries) {
    next[token] = encryptString(String(original), key);
  }
  ensurePiiDir();
  atomicWrite(piiMapPath(), `${JSON.stringify(next, null, 2)}\n`, 0o600);
  return next;
}

/** Decrypt one stored token on this PC. Returns null if missing. */
export function decryptPiiToken(token: string): string | null {
  const blob = loadEncryptedPiiMap()[token];
  if (!blob) return null;
  return decryptString(blob, loadOrCreateKey());
}
