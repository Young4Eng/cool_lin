// 첨부파일 다운로드 기한.
//
// 쿨메신저 첨부는 쪽지를 받은 날로부터 보름 안에 내려받아야 사라지지 않는다. 그런데
// 위젯이 보여 주는 것은 «일정 날짜»라 정작 급한 «첨부 만료»가 눈에 띄지 않는다.
// 그래서 원문 쪽지의 받은 시각에서 따로 세어 카드에 한 줄로 붙인다.
//
// 보관 기간은 학교 설정에 따라 다를 수 있으므로 한 곳에 상수로 둔다.

export const ATTACHMENT_KEEP_DAYS = 15;

/**
 * 쿨메신저 내보내기의 「날짜/시간」을 로컬 자정 기준 Date 로 읽는다.
 *
 * `2026/08/26 17:05:09` 처럼 오는데, 시간대가 없는 한국 시각이라 Date 파서에 그대로
 * 넘기면 브라우저마다 다르게 읽는다. 숫자만 뽑아 직접 만든다.
 */
export function parseSentDate(sentAt) {
  if (typeof sentAt !== 'string') return null;
  const m = sentAt.trim().match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * 첨부 다운로드가 며칠 남았나. 첨부가 없거나 날짜를 못 읽으면 null.
 *
 * 0 이면 오늘이 마지막 날, 음수면 이미 지났다.
 */
export function attachmentDaysLeft(event, now = new Date(), keepDays = ATTACHMENT_KEEP_DAYS) {
  const source = event?.source;
  if (!source || !source.attachment) return null;

  const sent = parseSentDate(source.sentAt);
  if (!sent) return null;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(sent);
  deadline.setDate(deadline.getDate() + keepDays);

  return Math.round((deadline - today) / 86400000);
}

/**
 * 카드에 붙일 한 줄. 남은 기간이 없으면 null 을 돌려 아무것도 그리지 않게 한다.
 *
 * 「D-12」처럼 쓰지 않는다 — 일정의 D-day 와 나란히 놓이면 어느 쪽 숫자인지 헷갈린다.
 */
export function attachmentNotice(event, now = new Date()) {
  const days = attachmentDaysLeft(event, now);
  if (days === null) return null;

  if (days < 0) return { text: '첨부 기한 지남', tone: 'expired', days };
  if (days === 0) return { text: '첨부 오늘까지', tone: 'urgent', days };
  if (days <= 3) return { text: `첨부 ${days}일 남음`, tone: 'urgent', days };
  return { text: `첨부 ${days}일 남음`, tone: 'normal', days };
}
