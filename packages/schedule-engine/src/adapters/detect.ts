import { open } from "node:fs/promises";
import type { WorkbookFormat } from "../types.js";

/**
 * 확장자를 믿지 않고 파일 앞부분을 읽어 실제 형식을 판별한다 (기술계획서 8.1).
 * 쿨메신저가 `.xls`로 내보낸 파일이 실제로는 SpreadsheetML 2003 XML인 경우가 있다.
 */
export async function detectFormat(filePath: string): Promise<WorkbookFormat | null> {
  const fh = await open(filePath, "r");
  try {
    const head = Buffer.alloc(4096);
    const { bytesRead } = await fh.read(head, 0, 4096, 0);
    const buf = head.subarray(0, bytesRead);

    if (buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) {
      return "ole2-biff";
    }
    if (buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
      return "zip-xlsx";
    }

    // BOM을 떼고 앞부분이 XML이면서 SpreadsheetML 네임스페이스를 갖고 있는지 본다.
    let text = buf.toString("utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const trimmed = text.trimStart();
    const looksXml = trimmed.startsWith("<?xml") || trimmed.startsWith("<Workbook");
    if (looksXml && text.includes("urn:schemas-microsoft-com:office:spreadsheet")) {
      return "spreadsheetml-2003";
    }
    return null;
  } finally {
    await fh.close();
  }
}
