// 쿨메신저 내보내기 파일을 위젯 안에서 직접 읽는다.
//
// 예전에는 이 일을 Node 서버가 했다. 그러면 교사가 `npm run dev:server` 를 띄워야만
// 위젯이 일정을 보여 준다 — 설치해서 쓰는 프로그램이 그럴 수는 없다. 파일을 읽는 것은
// 셸(Rust)이 하고, 해석은 여기서 한다.
//
// **규칙은 여전히 엔진 한 곳에만 있다.** 여기서 하는 일은 «표를 쪽지 목록으로 바꾸는 것»
// 뿐이고, 「이 쪽지에서 어떤 일정이 나오는가」는 packages/schedule-engine 이 정한다.

import { extractFromMessage } from '@cool-lin/schedule-engine/browser';
import { candidateToEvent, DEFAULT_ROLE } from './scheduleEngineAdapter';

/**
 * 쿨메신저가 내보내는 `.xls` 는 이름과 달리 SpreadsheetML 2003 **XML** 이다
 * (packages/schedule-engine/README 4장). 브라우저의 DOMParser 로 그대로 읽힌다.
 *
 * @returns {{name: string, rows: Array<Record<string,string>>}[]}
 */
export function parseExportXml(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('내보내기 파일을 읽지 못했습니다 (XML 형식이 아닙니다).');
  }

  const sheets = [];
  for (const sheet of doc.getElementsByTagName('Worksheet')) {
    const name = sheet.getAttribute('ss:Name') || sheet.getAttribute('Name') || '';
    const rowEls = [...sheet.getElementsByTagName('Row')];
    if (rowEls.length === 0) continue;

    // 첫 줄이 머리글이다. 위치가 아니라 **이름으로** 열을 찾는다 — 열 순서는 바뀔 수 있다.
    const header = cellsOf(rowEls[0]);
    const rows = [];
    for (const rowEl of rowEls.slice(1)) {
      const values = cellsOf(rowEl);
      if (values.every((v) => v === '')) continue;
      const row = {};
      header.forEach((key, i) => {
        if (key) row[key] = values[i] ?? '';
      });
      rows.push(row);
    }
    sheets.push({ name, rows });
  }
  return sheets;
}

/** 한 줄의 셀 값들. `ss:Index` 를 존중하지 않으면 열이 밀린다. */
function cellsOf(rowEl) {
  const out = [];
  for (const cell of rowEl.getElementsByTagName('Cell')) {
    const index = cell.getAttribute('ss:Index');
    if (index) {
      const at = Number(index) - 1;
      while (out.length < at) out.push('');
    }
    const data = cell.getElementsByTagName('Data')[0];
    out.push((data?.textContent ?? '').trim());
  }
  return out;
}

/**
 * 내보내기 파일 하나에서 위젯 일정을 뽑는다.
 *
 * @param {string} text 내보내기 파일 내용 (BOM 은 셸이 떼고 준다)
 * @param {{ role?: object, now?: Date|null }} [options]
 */
export function eventsFromExport(text, options = {}) {
  const { role = DEFAULT_ROLE, now = new Date() } = options;
  const events = [];
  const seen = new Set();

  for (const sheet of parseExportXml(text)) {
    for (const row of sheet.rows) {
      const body = row['내용'] ?? '';
      const sentAt = row['날짜/시간'] ?? '';
      if (!body || !sentAt) continue;

      const who = row['보낸사람'] ?? row['받은사람'] ?? '';
      // 원문은 카드 요약과 «더블클릭 원문»이 쓴다.
      const source = {
        sheet: sheet.name,
        kind: row['구분'] ?? '',
        from: who,
        subject: row['제목'] ?? '',
        sentAt,
        body,
        attachment: row['첨부파일'] ?? '',
      };

      // 지난 날짜도 뽑는다. **검토함에만 올라간다** — 자동 등록은 엔진의 안전 조건이
      // 「이미 지난 날짜」를 막기 때문이다(policy/autoRegister.ts). 예전에는 여기서
      // 아예 버려서, 어제 마감이던 제출물이 검토함에도 뜨지 않았다. 아직 안 낸 사람에게
      // 그게 제일 필요한 항목인데도. 얼마나 옛것까지 볼지는 가져올 기간으로 정한다.
      const candidates = extractFromMessage(
        { subject: source.subject, body, sentAt },
        { role, now, includePast: true },
      );

      for (const candidate of candidates) {
        const event = candidateToEvent(candidate);
        if (!event) continue;
        // 한 파일 안에서 같은 일정이 여러 쪽지에 나오면 하나만 남긴다.
        const key = `${event.date}|${event.time}|${event.title}|${event.category}`;
        if (seen.has(key)) continue;
        seen.add(key);
        events.push({ ...event, source });
      }
    }
  }

  return events;
}
