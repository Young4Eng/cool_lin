import { readFile, stat } from "node:fs/promises";
import type { SheetData } from "../types.js";
import { LIMITS, WorkbookLimitError } from "./limits.js";

/**
 * SpreadsheetML 2003 (`.xls` 확장자를 가진 XML) 직접 파서.
 *
 * calamine·SheetJS 계열은 OLE2와 ZIP만 읽으므로 이 형식은 직접 처리해야 한다.
 * 지켜야 할 것 (기술계획서 8.1):
 *  - 네임스페이스 접두어를 떼고 이름을 비교한다 (`ss:Name` == `Name`)
 *  - 스스로 닫는 `<Cell/>` 은 종료 이벤트가 오지 않으므로 따로 처리한다
 *  - `ss:Index` 를 존중한다. 무시하면 열이 밀려 제목 자리에 날짜가 들어간다
 *  - 한도를 넘으면 부분 결과를 만들지 않고 오류를 낸다
 */

const XML_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

function decodeEntities(s: string): string {
  if (!s.includes("&")) return s;
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, ent: string) => {
    if (ent.startsWith("#x") || ent.startsWith("#X")) {
      const cp = Number.parseInt(ent.slice(2), 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : whole;
    }
    if (ent.startsWith("#")) {
      const cp = Number.parseInt(ent.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : whole;
    }
    return XML_ENTITIES[ent] ?? whole;
  });
}

/** `ss:Name` / `Name` 둘 다 같은 이름으로 본다. */
function localName(tag: string): string {
  const colon = tag.indexOf(":");
  return (colon === -1 ? tag : tag.slice(colon + 1)).toLowerCase();
}

function readAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of source.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"|([\w:.-]+)\s*=\s*'([^']*)'/g)) {
    const name = m[1] ?? m[3];
    const value = m[2] ?? m[4];
    if (name !== undefined && value !== undefined) attrs[localName(name)] = decodeEntities(value);
  }
  return attrs;
}

interface Tag {
  name: string;
  attrs: Record<string, string>;
  selfClosing: boolean;
  closing: boolean;
  /** 태그 뒤에 이어지는 텍스트 */
  textAfter: string;
}

/** 태그와 그 뒤 텍스트를 차례로 뽑는다. CDATA와 주석은 건너뛴다. */
function* scanTags(xml: string): Generator<Tag> {
  let i = 0;
  const len = xml.length;
  while (i < len) {
    const lt = xml.indexOf("<", i);
    if (lt === -1) return;

    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt);
      if (end === -1) throw new WorkbookLimitError("XML_BROKEN", "주석이 닫히지 않았습니다.");
      i = end + 3;
      continue;
    }
    if (xml.startsWith("<![CDATA[", lt)) {
      const end = xml.indexOf("]]>", lt);
      if (end === -1) throw new WorkbookLimitError("XML_BROKEN", "CDATA가 닫히지 않았습니다.");
      i = end + 3;
      continue;
    }
    if (xml.startsWith("<?", lt) || xml.startsWith("<!", lt)) {
      const end = xml.indexOf(">", lt);
      if (end === -1) throw new WorkbookLimitError("XML_BROKEN", "선언이 닫히지 않았습니다.");
      i = end + 1;
      continue;
    }

    const gt = xml.indexOf(">", lt);
    if (gt === -1) throw new WorkbookLimitError("XML_BROKEN", "태그가 닫히지 않았습니다.");

    let inner = xml.slice(lt + 1, gt);
    const closing = inner.startsWith("/");
    if (closing) inner = inner.slice(1);
    const selfClosing = inner.endsWith("/");
    if (selfClosing) inner = inner.slice(0, -1);

    const spaceAt = inner.search(/[\s]/);
    const rawName = spaceAt === -1 ? inner : inner.slice(0, spaceAt);
    const attrSource = spaceAt === -1 ? "" : inner.slice(spaceAt);

    const nextLt = xml.indexOf("<", gt + 1);
    const textAfter = xml.slice(gt + 1, nextLt === -1 ? len : nextLt);

    yield {
      name: localName(rawName),
      attrs: attrSource ? readAttributes(attrSource) : {},
      selfClosing,
      closing,
      textAfter,
    };

    i = nextLt === -1 ? len : nextLt;
  }
}

export async function parseSpreadsheetML(filePath: string): Promise<SheetData[]> {
  const info = await stat(filePath);
  if (info.size > LIMITS.maxFileBytes) {
    throw new WorkbookLimitError("FILE_TOO_LARGE", `파일이 안전 한도(${LIMITS.maxFileBytes}바이트)를 넘습니다.`);
  }

  let xml = await readFile(filePath, "utf8");
  if (xml.charCodeAt(0) === 0xfeff) xml = xml.slice(1);

  const sheets: SheetData[] = [];
  let sheet: SheetData | null = null;
  let row: string[] | null = null;
  /** 다음 셀이 들어갈 열 번호 (0-based) */
  let column = 0;
  /** 현재 <Data> 안에서 모으는 텍스트 */
  let dataBuffer: string | null = null;
  let cellOpen = false;

  const finishRow = () => {
    if (!sheet || !row) return;
    // 완전히 빈 행은 건너뛴다.
    if (row.some((c) => c.length > 0)) sheet.rows.push(row);
    row = null;
  };

  for (const tag of scanTags(xml)) {
    switch (tag.name) {
      case "worksheet": {
        if (tag.closing) {
          finishRow();
          sheet = null;
          break;
        }
        if (sheets.length >= LIMITS.maxSheets) {
          throw new WorkbookLimitError("TOO_MANY_SHEETS", "시트 수가 안전 한도를 넘습니다.");
        }
        sheet = { name: tag.attrs["name"] ?? `Sheet${sheets.length + 1}`, rows: [] };
        sheets.push(sheet);
        if (tag.selfClosing) sheet = null;
        break;
      }

      case "row": {
        if (!sheet) break;
        if (tag.closing) {
          finishRow();
          break;
        }
        if (sheet.rows.length >= LIMITS.maxRowsPerSheet) {
          throw new WorkbookLimitError("TOO_MANY_ROWS", "행 수가 안전 한도를 넘습니다.");
        }
        row = [];
        column = 0;
        // ss:Index 는 행에도 붙을 수 있지만 행 번호는 순서만 쓰므로 무시한다.
        if (tag.selfClosing) finishRow();
        break;
      }

      case "cell": {
        if (!row) break;
        if (tag.closing) {
          cellOpen = false;
          break;
        }
        // ss:Index 는 빈 칸을 건너뛰는 표준 방식이다. 존중하지 않으면 열이 밀린다.
        const indexAttr = tag.attrs["index"];
        if (indexAttr !== undefined) {
          const target = Number.parseInt(indexAttr, 10) - 1;
          if (!Number.isFinite(target) || target < 0 || target >= LIMITS.maxColumns) {
            throw new WorkbookLimitError("BAD_CELL_INDEX", "셀 열 번호가 안전 한도를 벗어납니다.");
          }
          while (row.length < target) row.push("");
          column = target;
        }
        while (row.length < column) row.push("");
        // 스스로 닫는 <Cell/> 은 종료 이벤트가 없으므로 여기서 빈 값으로 확정한다.
        if (tag.selfClosing) {
          row.push("");
          column += 1;
          cellOpen = false;
        } else {
          cellOpen = true;
        }
        break;
      }

      case "data": {
        if (!row || !cellOpen) break;
        if (tag.closing) {
          const value = decodeEntities(dataBuffer ?? "");
          if (value.length > LIMITS.maxCellChars) {
            throw new WorkbookLimitError("CELL_TOO_LONG", "셀 길이가 안전 한도를 넘습니다.");
          }
          while (row.length < column) row.push("");
          row.push(value);
          column += 1;
          dataBuffer = null;
          break;
        }
        if (tag.selfClosing) {
          while (row.length < column) row.push("");
          row.push("");
          column += 1;
          break;
        }
        dataBuffer = tag.textAfter;
        break;
      }

      default: {
        // <Data> 안에 <B/>, <Font/> 같은 서식 태그가 섞여 있으면 그 사이 텍스트도 이어 붙인다.
        if (dataBuffer !== null) dataBuffer += tag.textAfter;
        break;
      }
    }
  }

  if (sheets.length === 0) {
    throw new WorkbookLimitError("NO_SHEET", "워크시트를 찾지 못했습니다.");
  }
  return sheets;
}
