# cool_lin

이 프로젝트는 도전형 해커톤을 위한 것입니다.

## 구조

```
client/                          React + TypeScript (Vite)  — http://localhost:5173
server/                          Express + TypeScript       — http://localhost:4000
packages/schedule-engine/        쿨메신저 .xls → 일정 후보 추출 규칙 엔진 (역할 3, issue #2)
apps/coolmessenger-widget-demo/  독립 실행형 데모: 로컬 AI 일정 추출 + 데스크톱 위젯 (역할 1+2, 임시)
```

`client`의 `/api/*` 요청은 Vite dev 프록시를 통해 `server`로 전달됩니다.

### 일정 추출 규칙은 한 곳에만 있습니다

`server`와 `apps/coolmessenger-widget-demo` 둘 다 `packages/schedule-engine`을 씁니다.
규칙을 두 벌로 두면 「위젯과 서버가 같은 쪽지를 두고 서로 다른 날짜를 말하는」 일이 생기므로,
추출 규칙을 고칠 일이 있으면 반드시 엔진 쪽을 고칩니다.

```
쿨메신저 .xls ──▶ server/python (내려받기)
                      │
                      ▼
              packages/schedule-engine  ◀── 규칙은 여기 한 곳
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  server  POST /api/candidates   위젯 (브라우저 진입점)
```

- 규칙 전체: `packages/schedule-engine/RULES.md`
- 위젯 연동: `apps/coolmessenger-widget-demo/ENGINE.md`
- 서버 경로: `POST /api/ingest`, `POST /api/open-latest` 는 내려받기 결과에
  `candidates` 를 함께 돌려줍니다. 이미 가진 파일로 다시 뽑으려면 `POST /api/candidates {file}`.

`apps/coolmessenger-widget-demo`는 `client`/`server` 구조가 잡히기 전에 먼저 만들어진
자체완결형(self-contained) 데모입니다 — 쿨메신저 UI, 일정 위젯, 별도 창으로 뜨는 데스크톱
캘린더 위젯까지 혼자서 돌아갑니다. 나중에 `client` 로 흡수/정리 예정인 임시 병존 상태입니다.
지금 바로 훑어보려면:

```bash
cd apps/coolmessenger-widget-demo
npm install
npm run dev      # http://localhost:3000
```

## 실행

```bash
npm run install:all   # 최초 1회
npm install           # 루트 (concurrently)
npm run dev           # server + client 동시 실행
```

개별 실행:

```bash
npm run dev:server
npm run dev:client
```

## 빌드

```bash
npm run build
```

## 쿨메신저 메시지 엑셀 내려받기 (이슈 #1)

이 기능은 이미 켜 있는 쿨메신저(모의) 창을 조작한다. 메신저를 새로 켜지 않고, 메인 창이든 메시지 관리함이 이미 열려 있든 어제~오늘 텍스트를 xls로 받는다.

Windows에서 Python 의존성을 설치한다:

```bash
pip install -r server/python/requirements.txt
```

그다음 앱을 실행한다:

```bash
npm run install:all
npm run dev
```

브라우저에서 http://localhost:5173 을 연 뒤, 쿨메신저가 이미 실행 중이면 `어제~오늘 메시지 가져오기` 버튼을 누른다.

로컬 AI 일정 추출은 이 작업 범위가 아니다 (이슈 #2).
