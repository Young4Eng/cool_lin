# cool_lin

이 프로젝트는 도전형 해커톤을 위한 것입니다.

## 구조

```
client/                          React + TypeScript (Vite)  — http://localhost:5173
server/                          Express + TypeScript       — http://localhost:4000
packages/schedule-engine/        쿨메신저 .xls → 일정 후보 추출 규칙 엔진 (역할 3, issue #2)
apps/coolmessenger-widget-demo/  독립 실행형 데모: 로컬 AI 일정 추출 + 데스크톱 위젯 (역할 1+2, 임시)
docs/reference/coolmessenger-gentoo/  목업 메신저 "정답지" — CoolMessenger.exe(GENTOO 빌드)에서 추출
```

### 목업 메신저 레퍼런스 (정답지)

`CoolMessenger.exe` 는 팀원이 만든 완결형 목업 "CoolMessenger GENTOO"(Neutralino + React) 다.
그 웹앱 소스를 `docs/reference/coolmessenger-gentoo/` 로 추출해 두었고, 이걸 기준으로
`apps/coolmessenger-widget-demo` 의 목업 쿨메신저 UI·동작·시드 데이터를 맞춰 나간다.
기능/디자인 토큰/시드 스키마/패리티 표: `docs/reference/coolmessenger-gentoo/FEATURES.md`.
(exe 바이너리 자체는 커밋하지 않는다 — `.gitignore`.)

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
- 자동 등록 기준 단계(`아주 확실한 것만` / `분명한 일정까지`)는 엔진 옵션 하나로 바꾼다:
  `runPipeline(files, { autoRegisterLevel })` · `extractFromMessage(msg, { autoRegisterLevel })`.
  안전 조건은 단계와 무관하게 그대로다 (기술계획서 7.6, 엔진 README 2장)
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

## 바탕화면 위젯 설치본 만들기

위젯 데모(`apps/coolmessenger-widget-demo`)에는 Tauri 2 셸이 붙어 있어 설치파일을 만들 수 있다
(기술계획서 4장이 정한 셸). Rust 툴체인과 WebView2 런타임이 필요하다.

```bash
npm --prefix apps/coolmessenger-widget-demo run tauri build
```

`src-tauri/target/release/bundle/nsis/` 에 `*_x64-setup.exe` 가 생긴다 (약 1.2MB,
사용자 계정 설치라 관리자 권한이 필요 없다).

**창은 위젯 하나다.** 설치본은 「일정도우미」 메인 창을 띄우지 않는다.

위젯 창 위치는 **`tauri.conf.json` 에 적지 않는다.** 배율이 다른 PC 에서 화면 밖으로 밀려나기
때문이다 (150% 배율에서 `x: 1480` 이 물리 1850px 이 되어 잘렸다). `src-tauri/src/main.rs` 가
실행 시점에 주 모니터 오른쪽 위로 계산해 붙인다.

### 위젯이 혼자 하는 일

메인 창이 없으므로 쿨메신저에서 가져오는 일도 위젯이 직접 한다
(`src/services/widgetIngest.js`).

| 언제 | 무엇을 | 화면을 건드리는가 |
|---|---|---|
| 켜자마자 · 그 뒤 10분마다 | 바탕화면의 가장 최근 `coolmsg_*.xls` 를 읽어 다시 뽑는다 | 아니오 |
| 「쿨메신저에서 가져오기」를 누를 때 | 쿨메신저 창을 조작해 새로 받는다 | 예 (10초쯤) |

**설치본에는 Node 서버가 필요 없다.** 예전에는 위젯이 `localhost:4000` 에 물어봤는데,
그러면 교사가 `npm run dev:server` 를 직접 띄워야 위젯이 일정을 보여 준다 — 설치해서
쓰는 프로그램이 그럴 수는 없다. 지금은 이렇게 나눈다.

| 하는 일 | 누가 |
|---|---|
| 바탕화면에서 최신 내보내기 파일 찾아 읽기 | 셸 (Rust, `read_latest_export`) |
| 쿨메신저 창 조작해 새로 내려받기 | 셸이 `py -3 ingest.py` 를 직접 실행 (`run_messenger_download`) |
| 표를 쪽지 목록으로 바꾸기 | 위젯 (`src/services/localExport.js`, DOMParser) |
| 쪽지에서 일정 뽑기 | **엔진** (`@cool-lin/schedule-engine/browser`) |

규칙은 여전히 엔진 한 곳에만 있다. 파이썬 자동화(`server/python`)는 설치본 안에
`python/` 으로 함께 들어간다. 파이썬 자체는 PC 에 있어야 한다 (`py -3`).

브라우저에서 열었을 때는 예전처럼 서버 경로를 쓴다.

가져오는 동안 **위젯은 잠깐 숨는다.** 위젯은 「항상 위」이고 버튼을 누른 직후에는
포그라운드까지 쥐고 있어서, 그대로 두면 자동화가 메신저 창을 앞으로 꺼내지 못하고
화면을 찍을 때 메신저 대신 위젯 픽셀이 찍혀 단추를 찾지 못한다. 실패해도 반드시 다시
보이게 한다 — 숨은 채로 남으면 사용자가 위젯을 되찾을 방법이 없다.

쿨메신저 창을 실제로 조작하는 쪽은 **사람이 누를 때만** 돈다. 수업 중에 창이 저절로 앞으로
튀어나오면 안 된다. 엔진이 «자동등록 가능»이라고 한 후보만 캘린더로 가고, 나머지는 검토함에
남는다. 후보 id 는 매번 새로 만들어지므로 «날짜·시각·제목·분류»로 중복을 거른다.

### 카드에는 «무엇을 · 언제 · 무슨 내용» 셋만 둔다

분류·AI 표시·신뢰도·판단 근거·원문 안내가 카드마다 줄줄이 붙어 있었다. 위젯은 흘깃 보는
자리라 그 줄들이 정작 알고 싶은 «무슨 얘기냐»를 밀어냈다. 지금은 제목·날짜·요약만 남기고,
엔진이 어떻게 판단했는지는 검토함에서만 보여 준다.

요약은 **지어내지 않는다.** 원문에서 인사말·맺음말을 걷어낸 첫 문장을 그대로 쓴다
(`src/utils/summarizeMessage.js`). 없는 말을 만들어 넣으면 원문과 어긋났을 때 확인할
방법이 없다.

### 달력

`naemo.ai` 의 출결 달력을 참고했다 — 차가운 회색 대신 따뜻한 종이색(`#F8F8F5` 바탕,
`#E5E4E0` 선, `#1D1715` 글자), 칸 사이를 띄우지 않고 헤어라인으로 격자를 만드는 방식,
주말 칸을 절반 폭으로 줄여 평일에 자리를 몰아 주는 배치.

그대로 베끼지 않은 것: 참고한 달력은 칸 안에 항목 이름을 넣지만, 이 위젯은 폭이 380px 라
평일 한 칸이 50px 남짓이다. 글자를 넣으면 다 잘려서 칸에는 점만 두고 «무슨 내용인지»는
아래 목록 카드가 맡는다.

### 쪽지 원문 보기

일정 카드를 **더블클릭**하면 그 일정이 나온 쪽지 원문이 뜬다.

엔진은 개인정보 때문에 후보에 원문을 담지 않는다. 대신 `messageSentAt` 과 `counterpart` 를
원문 그대로 넘겨 주므로, 같은 응답에 들어 있는 시트 행과 맞추면 원문을 찾을 수 있다
(`src/services/realIngestClient.js`). 실제 파일에서 후보 7건 모두 원문이 연결됐다.
원문은 **믿을 수 없는 평문**이라 텍스트 노드로만 넣는다 — HTML 로 렌더링하지 않는다.

### 부팅 시 자동 실행

`HKCU\Software\Microsoft\Windows\CurrentVersion\Run` 에 사용자별 항목만 만든다
(관리자 권한 불필요, 기술계획서 7.9). 위젯을 처음 켜면 함께 켜진다 — 「컴퓨터를 켜면 위젯이
있다」가 위젯을 쓰는 사람의 기대이고, 설정 어딘가를 찾아 켜야만 그렇게 된다면 그것 자체가
설계 실패이기 때문이다. **다만 사용자가 스위치를 직접 만진 적이 있으면 그 선택을 이기지
않는다.** 스위치는 위젯 머리 오른쪽에 있다.

이미 등록돼 있으면 다시 쓰지 않고, 두 번째 실행은 첫 창을 꺼내 주고 물러난다
(기술계획서 8.6 가·라).

## 쿨메신저 메시지 엑셀 내려받기 (이슈 #1)

이 기능은 이미 켜 있는 쿨메신저(모의) 창을 조작한다. 메신저를 새로 켜지 않고, 메인 창이든 메시지 관리함이 이미 열려 있든 어제~오늘 텍스트를 xls로 받는다.

Windows에서 Python 의존성을 설치한다. **`pip` 가 아니라 `py -3` 로 설치한다.**

```bash
py -3 -m pip install -r server/python/requirements.txt
```

서버는 이 기능을 `py -3` 로 띄운다 (`server/src/index.ts` 의 `pythonCmd`). Python 이 여러 벌
깔려 있는 PC에서는 `pip` 가 가리키는 파이썬과 `py -3` 가 고르는 파이썬이 서로 다르다.
그냥 `pip install` 로 깔면 설치는 성공했는데 버튼을 눌렀을 때
`No module named 'cv2'` 가 뜬다. 어디에 깔렸는지는 이렇게 확인한다:

```bash
py -3 -c "import cv2, numpy, PIL; print('ok')"
```

그다음 앱을 실행한다:

```bash
npm run install:all
npm run dev
```

브라우저에서 http://localhost:5173 을 연 뒤, 쿨메신저가 이미 실행 중이면 `어제~오늘 메시지 가져오기` 버튼을 누른다.

로컬 AI 일정 추출은 이 작업 범위가 아니다 (이슈 #2).
