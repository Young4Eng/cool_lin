import { useCallback, useRef, useState } from 'react';

// 포인터로 끌어서 순서를 바꾼다.
//
// HTML5 `draggable` 을 쓰지 않는다. 설치본이 쓰는 WebView2 에서는 dragstart/drop 이
// 아예 오지 않아 순서 바꾸기가 통째로 먹통이 됐다 (브라우저 미리보기에서는 됐기 때문에
// 처음엔 눈치채지 못했다). pointer 이벤트는 두 곳 모두에서 똑같이 온다.
//
// 끌 대상은 `data-reorder-id` 를 단 요소, 「맨 위 고정」 자리는 `data-reorder-zone` 을
// 단 요소로 찾는다. 손잡이를 누른 채 움직이는 동안 커서 밑에 무엇이 있는지만 보면 되므로
// 목록 구조를 hook 이 알 필요가 없다.

export function useDragReorder(commit) {
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);
  const overRef = useRef(null);
  const zoneRef = useRef(false);

  const onHandlePointerDown = useCallback(
    (id) => (e) => {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      setDraggingId(id);
      overRef.current = null;
      zoneRef.current = false;

      const move = (ev) => {
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const row = el && el.closest ? el.closest('[data-reorder-id]') : null;
        const rowId = row ? row.getAttribute('data-reorder-id') : null;
        overRef.current = rowId && rowId !== id ? rowId : null;
        zoneRef.current = !!(el && el.closest && el.closest('[data-reorder-zone]'));
        setOverId(overRef.current);
      };

      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);

        const targetId = overRef.current;
        const intoZone = zoneRef.current;
        setDraggingId(null);
        setOverId(null);

        if (targetId) commit(id, { targetId });
        else if (intoZone) commit(id, { toPinnedEnd: true });
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [commit],
  );

  return { draggingId, overId, onHandlePointerDown };
}
