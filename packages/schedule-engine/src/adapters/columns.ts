import type { RawMessage, SheetData } from "../types.js";

/** 열은 위치가 아니라 헤더 이름으로 찾는다 (기술계획서 7.1). */
const HEADER_ALIASES = {
  kind: ["구분", "송수신"],
  counterpart: ["보낸사람", "받는사람", "받은사람", "발신자", "수신자"],
  title: ["제목"],
  sentAt: ["날짜", "시간", "일시"],
  body: ["내용", "본문"],
  attachment: ["첨부"],
} as const;

type Field = keyof typeof HEADER_ALIASES;

export interface ColumnMap {
  headerRow: number;
  columns: Partial<Record<Field, number>>;
  /** 알아보지 못해 무시한 열 이름. 진단 화면에 보여준다. */
  ignored: string[];
}

const squash = (s: string) => s.replace(/\s+/g, "");

function matchField(header: string): Field | null {
  const h = squash(header);
  if (h.length === 0) return null;
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [Field, readonly string[]][]) {
    if (aliases.some((alias) => h.includes(alias))) return field;
  }
  return null;
}

/**
 * 상단 12행까지 훑어 헤더 행을 찾는다.
 * 제목·내용·일시 중 둘 이상 + 전체 3개 이상을 찾았을 때만 헤더로 인정한다.
 */
export function findColumns(sheet: SheetData): ColumnMap | null {
  const scanLimit = Math.min(12, sheet.rows.length);
  for (let r = 0; r < scanLimit; r++) {
    const row = sheet.rows[r];
    if (!row) continue;

    const columns: Partial<Record<Field, number>> = {};
    const ignored: string[] = [];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c] ?? "";
      const field = matchField(cell);
      if (field === null) {
        if (squash(cell).length > 0) ignored.push(cell);
      } else if (columns[field] === undefined) {
        columns[field] = c;
      }
    }

    const core = (["title", "body", "sentAt"] as const).filter((f) => columns[f] !== undefined).length;
    const total = Object.keys(columns).length;
    if (core >= 2 && total >= 3) return { headerRow: r, columns, ignored };
  }
  return null;
}

/** 시트 이름으로 방향을 정한다. 공백을 지운 뒤 비교한다. */
export function sheetDirection(name: string): RawMessage["direction"] | null {
  const n = squash(name);
  if (n.includes("받은메시지")) return "received";
  if (n.includes("보낸메시지")) return "sent";
  return null;
}

export interface ExtractResult {
  messages: RawMessage[];
  ignoredColumns: string[];
  skippedRows: number;
}

/** 시트들에서 메시지 행을 뽑는다. 깨진 행은 처리를 멈추지 않고 건너뛴다. */
export function extractMessages(sheets: SheetData[]): ExtractResult {
  const messages: RawMessage[] = [];
  const ignoredColumns = new Set<string>();
  let skippedRows = 0;

  for (const sheet of sheets) {
    const direction = sheetDirection(sheet.name);
    if (direction === null) continue;

    const map = findColumns(sheet);
    if (map === null) {
      skippedRows += sheet.rows.length;
      continue;
    }
    for (const name of map.ignored) ignoredColumns.add(name);

    const at = (row: string[], field: Field): string => {
      const idx = map.columns[field];
      return idx === undefined ? "" : (row[idx] ?? "");
    };

    for (let r = map.headerRow + 1; r < sheet.rows.length; r++) {
      const row = sheet.rows[r];
      if (!row) continue;

      const body = at(row, "body");
      const title = at(row, "title");
      const counterpart = at(row, "counterpart");

      // 본문과 제목이 모두 비었거나 보낸사람이 «알 수 없음»인 행은 건너뛴다.
      if (body.trim().length === 0 && title.trim().length === 0) {
        skippedRows += 1;
        continue;
      }
      if (squash(counterpart) === "알수없음") {
        skippedRows += 1;
        continue;
      }

      messages.push({
        direction,
        kind: at(row, "kind"),
        counterpart,
        title,
        sentAtRaw: at(row, "sentAt"),
        body,
        attachment: at(row, "attachment"),
        origin: { sheet: sheet.name, row: r + 1 },
      });
    }
  }

  return { messages, ignoredColumns: [...ignoredColumns], skippedRows };
}
