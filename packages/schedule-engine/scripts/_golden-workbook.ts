/**
 * golden set(합성 데이터)을 SpreadsheetML 워크북 파일로 만든다.
 *
 * 평가(evaluate.ts)와 샘플 출력(sample.ts)이 같은 입력을 쓰도록 여기 한 벌만 둔다.
 * 파서까지 함께 지나가게 하려고 일부러 «파일»로 만든다.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface GoldenCase {
  id: string;
  note: string;
  sentAt: string;
  counterpart: string;
  title: string;
  body: string;
  expect: Record<string, unknown>;
}

export interface GoldenSet {
  referenceDate: string;
  cases: GoldenCase[];
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cell = (v: string) => `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`;
const row = (cells: string[]) => `<Row>${cells.map(cell).join("")}</Row>`;

export const HEADER = ["구분", "보낸사람", "제목", "날짜/시간", "내용", "첨부파일"];

export async function loadGolden(fixturePath = "fixtures/golden.json"): Promise<GoldenSet> {
  return JSON.parse(await readFile(path.resolve(fixturePath), "utf8")) as GoldenSet;
}

/** 케이스들을 «받은메시지» 시트 하나로 묶어 파일에 쓴다. */
export async function writeGoldenWorkbook(filePath: string, cases: GoldenCase[]): Promise<string> {
  const body = cases.map((c) => row(["일반 메시지", c.counterpart, c.title, c.sentAt, c.body, ""])).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="받은메시지"><Table>
${row(HEADER)}
${body}
 </Table></Worksheet>
</Workbook>`;
  // BOM을 붙여야 형식 판별이 SpreadsheetML로 떨어진다.
  await writeFile(filePath, "﻿" + xml, "utf8");
  return filePath;
}
