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

---

## 막혔을 때

| 증상 | 원인과 해결 |
|---|---|
| `Could not resolve @cool-lin/schedule-engine/browser` | 위젯 폴더에서 `npm install`을 안 했습니다. `file:` 의존이라 각자 컴퓨터에서 한 번은 링크를 만들어야 합니다 |
| `packages/schedule-engine 을 찾지 못했습니다` | 위젯 폴더만 따로 받았습니다. 저장소 전체를 클론해야 합니다 |
| 규칙을 고쳤는데 화면이 그대로 | 개발 서버가 켜져 있으면 반영되지 않습니다. 껐다 켜세요 |
| `tsc: not found` / 엔진 빌드 실패 | Node 18 이상이 필요합니다. `node -v` 로 확인하세요 |
| 일정이 하나도 안 잡힘 | 고장이 아닐 수 있습니다. 쪽지 안의 날짜가 이미 지났거나(가장 흔함), 날짜 표현이 아예 없거나, `message.timestamp`를 안 넘긴 경우입니다 |

확인된 환경: Node 24 / npm 11 / Windows. 새로 클론해서 `npm install` → `npm run build`
두 단계만으로 돌아가는 것을 확인했습니다.

## 실제 쿨메신저 -> 로컬 AI items -> 캘린더

교사 버튼은 위젯에 있습니다. `어제~오늘 쪽지 가져오기` 가 `POST /api/ingest` 를 호출하고, 서버는 내려받기와 Ollama ingest 를 기다린 뒤 `items` 를 같은 JSON 에 넣습니다. 위젯은 `aiItemMapper.js` 로 items 를 일정으로 바꾸고, items 가 비면 `candidates` 로 폴백합니다. Ollama 가 꺼져 있어도 추출은 성공합니다. 요약/스마트 답장은 `POST /api/local-ai/complete` 로 서버에서 비식별한 뒤에만 모델로 보냅니다. pii_map 은 브라우저에 내려가지 않습니다.
