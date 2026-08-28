// 별표(고정)와 드래그 순서 재배치 — 할 일·일정 둘 다, 그리고 한 화면에 섞어
// 보여줄 때도 같은 방식을 쓴다.
//
// 순서는 pinOrder 숫자 하나로만 정해진다. 그래서 서로 다른 배열(일정 배열과
// 할 일 배열)에서 온 항목이라도 숫자만 비교하면 함께 정렬할 수 있고, 드래그로
// 다른 종류의 항목 사이에 끼워 넣을 때도 두 이웃의 pinOrder 중간값만 계산하면
// 된다 — 배열을 합치거나 전체를 다시 매길 필요가 없다.

export function isPinned(item) {
  return !!item.starred;
}

export function pinnedSorted(items) {
  return items.filter(isPinned).sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0));
}

/** 두 이웃 pinOrder 사이(또는 맨 위/맨 아래) 새 값을 고른다. */
export function pinOrderBetween(beforeOrder, afterOrder) {
  if (beforeOrder == null && afterOrder == null) return 0;
  if (beforeOrder == null) return afterOrder - 1;
  if (afterOrder == null) return beforeOrder + 1;
  return (beforeOrder + afterOrder) / 2;
}

/** 별표를 켠다 — 지금 고정된 것 중 가장 위보다 더 위(더 작은 pinOrder)로 간다. */
export function withPinnedOn(items, id) {
  const top = pinnedSorted(items)[0];
  const order = pinOrderBetween(null, top ? top.pinOrder : null);
  return items.map((it) => (it.id === id ? { ...it, starred: true, pinOrder: order } : it));
}

/** 별표를 끈다. pinOrder 는 남겨 둔다 — 나중에 다시 켜도 대충 비슷한 자리로 온다. */
export function withPinnedOff(items, id) {
  return items.map((it) => (it.id === id ? { ...it, starred: false } : it));
}

export function withStarToggled(items, id) {
  const target = items.find((it) => it.id === id);
  if (!target) return items;
  return isPinned(target) ? withPinnedOff(items, id) : withPinnedOn(items, id);
}

/** 드래그로 옮긴 자리에 맞춰 한 항목의 순서를 새로 매긴다 — 자동으로 별표도 켠다. */
export function withPinOrder(items, id, order) {
  return items.map((it) => (it.id === id ? { ...it, starred: true, pinOrder: order } : it));
}
