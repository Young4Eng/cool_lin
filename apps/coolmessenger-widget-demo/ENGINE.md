# 규칙 엔진 연결 안내

이 위젯은 일정 추출을 **직접 하지 않고** `packages/schedule-engine`에 맡깁니다.

```
위젯 컴포넌트
  └ services/localAiService.js        extractScheduleFromText / extractSchedulesFromMessage
      └ services/scheduleEngineAdapter.js   Candidate → 위젯 일정 객체 변환만
          └ @cool-lin/schedule-engine/browser
```

---

## 처음 받았을 때

```bash
npm install
npm run dev
```

이게 전부입니다. `predev`가 엔진 빌드 여부를 확인해서 없거나 오래됐으면 알아서 빌드합니다
(`scripts/ensure-engine.mjs`).

저장소 전체를 한 번에 준비하려면 루트에서:

```bash
npm run install:all
```

## 왜 별도 빌드가 필요한가

엔진은 TypeScript라 `dist/`를 만들어야 위젯이 `import` 할 수 있는데, `dist/`는
`.gitignore` 대상입니다. 그래서 저장소를 새로 받으면 `dist/`가 없고
`Could not resolve @cool-lin/schedule-engine/browser` 로 빌드가 깨집니다.
`predev`/`prebuild`가 이 상황을 자동으로 막아 줍니다.

## 엔진 규칙을 고쳤을 때

`packages/schedule-engine/src` 를 고치면 `npm run dev`/`npm run build` 할 때
바뀐 걸 감지해 다시 빌드합니다. 개발 서버를 켜 둔 채로 고쳤다면 서버를 한 번 껐다 켜세요.

수동으로 빌드하려면:

```bash
npm --prefix ../../packages/schedule-engine run build
```

---

## 엔진이 주는 값

`scheduleEngineAdapter`가 기존 일정 객체 필드(`title`, `date`, `time`, `category`,
`priority`, `location`, `description`)를 그대로 채우고, 판단 정보를 덧붙입니다.

| 필드 | 뜻 |
|---|---|
| `confidenceBand` | `높음` / `검토 필요` / `낮음` — 화면에는 숫자 대신 이것만 보여주세요 |
| `candidateType` | `OFFICIAL_EVENT` · `DEADLINE` · `PERSONAL_TASK` · `OPTIONAL_EVENT` 등 |
| `ambiguityFlags` | `요일만 적힘`, `교시표 미설정` 등. **하나라도 있으면 사용자 확인 없이 등록하면 안 됩니다** |
| `autoRegisterEligible` | 자동등록 안전 조건을 모두 통과했는가 |
| `autoRegisterBlockers` | 통과하지 못한 이유. 그대로 사용자에게 보여줄 수 있는 문장입니다 |
| `keywords` | 캘린더에 넣을 핵심 일정 단어 |

### 지켜야 할 것

- **`time`이 비어 있을 수 있습니다.** 본문에 시각이 없거나 교시만 적힌 경우입니다.
  `00:00`으로 채우지 마세요. 교시는 `description`에 `5~6교시 · 시간 미설정`으로 들어갑니다.
- **`date`는 시간대 표시가 없는 한국 시각입니다.** `new Date(date)`로 파싱하면
  브라우저 시간대에 따라 하루 밀립니다. 문자열로 다루세요.
- **`title`은 믿을 수 없는 평문입니다.** `dangerouslySetInnerHTML`에 넣지 마세요.
- 기준 시각은 **쪽지를 받은 날**입니다. `message.timestamp`를 반드시 넘겨야
  「모레」·「금요일까지」가 계산됩니다.

규칙 자체가 궁금하면 `packages/schedule-engine/RULES.md` 를 보세요.
어댑터는 변환만 하므로, 추출 결과가 이상하면 어댑터가 아니라 엔진을 고쳐야 합니다.
