import { readFile, stat } from "node:fs/promises";
import * as XLSX from "xlsx";
import type { ParsedWorkbook, SheetData } from "../types.js";
import { detectFormat } from "./detect.js";
import { LIMITS, WorkbookLimitError } from "./limits.js";
import { parseSpreadsheetML } from "./spreadsheetml.js";

/** 수식·매크로·외부 링크를 따라가지 않도록 읽기 옵션을 좁힌다 (PRD 6장). */
const SAFE_READ_OPTIONS: XLSX.ParsingOptions = {
  cellFormula: false,
  cellHTML: false,
  cellStyles: false,
  bookVBA: false,
  cellDates: true,
  dense: false,
};

function sheetToRows(sheet: XLSX.WorkSheet): string[][] {
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: "", blankrows: false });
  const rows: string[][] = [];
  for (const line of raw) {
    if (rows.length >= LIMITS.maxRowsPerSheet) {
      throw new WorkbookLimitError("TOO_MANY_ROWS", "행 수가 안전 한도를 넘습니다.");
    }
    const cells = line.map((value) => {
      if (value === null || value === undefined) return "";
      const text = value instanceof Date ? value.toISOString() : String(value);
      if (text.length > LIMITS.maxCellChars) {
        throw new WorkbookLimitError("CELL_TOO_LONG", "셀 길이가 안전 한도를 넘습니다.");
      }
      return text;
    });
    if (cells.some((c) => c.length > 0)) rows.push(cells);
  }
  return rows;
}

/**
 * `.xls` / `.xlsx` 를 형식에 따라 읽어 공통 시트 모델로 돌려준다.
 * 읽는 방법만 갈라지고 그 뒤 경로(헤더 찾기·셀 해석)는 하나다.
 */
export async function parseWorkbook(filePath: string): Promise<ParsedWorkbook> {
  const info = await stat(filePath);
  if (info.size > LIMITS.maxFileBytes) {
    throw new WorkbookLimitError("FILE_TOO_LARGE", "파일이 안전 한도를 넘습니다.");
  }

  const format = await detectFormat(filePath);
  if (format === null) {
    throw new WorkbookLimitError(
      "UNSUPPORTED_FORMAT",
      "확장자와 실제 파일 형식이 맞지 않습니다. 쿨메신저에서 다시 내보내 주세요.",
    );
  }

  let sheets: SheetData[];
  if (format === "spreadsheetml-2003") {
    sheets = await parseSpreadsheetML(filePath);
  } else {
    // SheetJS의 readFile은 ESM에서 fs를 잡지 못하므로 버퍼로 직접 넘긴다.
    const wb = XLSX.read(await readFile(filePath), { ...SAFE_READ_OPTIONS, type: "buffer" });
    if (wb.SheetNames.length > LIMITS.maxSheets) {
      throw new WorkbookLimitError("TOO_MANY_SHEETS", "시트 수가 안전 한도를 넘습니다.");
    }
    sheets = wb.SheetNames.map((name) => {
      const sheet = wb.Sheets[name];
      return { name, rows: sheet ? sheetToRows(sheet) : [] };
    });
  }

  return { format, sheets, ignoredColumns: [], skippedRows: 0 };
}
