// 같은 쪽지에서 나온 중복 항목을 하나로 줄인다.
//
// 규칙 엔진은 문장 단위로 판단하므로 쪽지 한 통에서 후보가 여럿 나온다. 대개는 그게
// 맞다 — 「9월 1일 연수」와 「9월 4일 제출」이 한 쪽지에 같이 적히기 때문이다. 문제는
// **같은 날짜를 가리키는 여러 문장**이다.
//
//   「1학년 건강검진 및 2학년 추가 검진 안내」 한 통 → 「안내」·「검진」 (둘 다 8/28)
//   「행정정보공유 동의서」 한 통             → 「제출」·「동의서 제출」 (둘 다 8/28)
//
// 사람 눈에는 한 가지 일인데 목록에는 두 줄로 앉는다. 같은 쪽지·같은 날짜·같은 시각이면
// 하나만 남긴다. 날짜나 시각이 다르면 남긴다 — 그건 진짜 다른 일이다.

/** 같은 것인지 가르는 열쇠. 같은 쪽지에서 나왔고 같은 때를 가리키면 같다. */
function eventKey(event) {
  const when = `${event.date ?? ''}|${event.time ?? ''}`;
  // 가져온 일정은 «어느 쪽지에서 나왔는가»가 가장 믿을 만한 신원이다.
  if (event.sourceGroupId) return `msg:${event.sourceGroupId}|${when}`;
  // 손으로 만든 일정에는 쪽지가 없다. 제목까지 같아야 같은 것으로 본다.
  return `own:${(event.title ?? '').trim()}|${when}`;
}

/**
 * 둘 중 남길 것을 고른다.
 *
 * 이미 사람이 확인했거나 구글 캘린더에 넣은 것은 무조건 남긴다 — 사용자의 손길이
 * 닿은 쪽을 지우면 안 된다. 그 다음은 신뢰도, 마지막은 «더 자세히 적힌 제목»이다
 * (「제출」보다 「동의서 제출」이 낫다).
 */
function better(a, b) {
  const touched = (e) => Boolean(e.googleCalendarAddedAt) || e.reviewed === true || Boolean(e.starred);
  if (touched(a) !== touched(b)) return touched(a) ? a : b;
  const ca = typeof a.confidence === 'number' ? a.confidence : 0;
  const cb = typeof b.confidence === 'number' ? b.confidence : 0;
  if (ca !== cb) return ca > cb ? a : b;
  return (b.title ?? '').length > (a.title ?? '').length ? b : a;
}

/** 중복을 지운 일정 목록. 순서는 원래대로 둔다. */
export function dedupeEvents(events) {
  if (!Array.isArray(events)) return [];
  const keep = new Map();
  for (const event of events) {
    if (!event || typeof event !== 'object') continue;
    const key = eventKey(event);
    const prev = keep.get(key);
    keep.set(key, prev ? better(prev, event) : event);
  }
  // 원래 순서를 지킨다. 목록이 재정렬되면 사용자는 무언가 사라졌다고 느낀다.
  const kept = new Set(keep.values());
  return events.filter((e) => kept.has(e));
}

/**
 * 중복을 지운 할 일 목록.
 *
 * 할 일에는 쪽지 정보가 없다. 같은 내용·같은 기한이면 같은 것으로 본다.
 */
export function dedupeTodos(todos) {
  if (!Array.isArray(todos)) return [];
  const keep = new Map();
  for (const todo of todos) {
    if (!todo || typeof todo !== 'object') continue;
    const key = `${(todo.text ?? '').trim()}|${todo.dueDate ?? ''}`;
    const prev = keep.get(key);
    // 완료 표시나 별표가 붙은 쪽을 남긴다 — 사용자가 만진 흔적이다.
    const touched = (t) => Boolean(t.completed) || Boolean(t.starred);
    keep.set(key, !prev || (!touched(prev) && touched(todo)) ? todo : prev);
  }
  const kept = new Set(keep.values());
  return todos.filter((t) => kept.has(t));
}
