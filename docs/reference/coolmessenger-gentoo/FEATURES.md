# CoolMessenger GENTOO — 기능 명세 (정답지)

`CoolMessenger.exe` 에서 추출한 목업 메신저의 기능·디자인·시드 데이터를 정리한 문서.
`apps/coolmessenger-widget-demo` 를 이 스펙에 맞춰 정렬하는 것이 목표다.
번들 심볼(`Bn`, `Ir`, `Nr` …) 은 `bundle.pretty.js` 에서 검색하면 해당 컴포넌트를 찾을 수 있다.

- 사용자: **김서준**, 2학년 3반 담임, 내선 132, 아바타 라벨 `2-3 (132)` (`Zt`/`Qt`)
- 학교: **한빛중학교** (`Yt`), 서버 IP 표시값 `5.75.80.2` (`Xt`)
- 기준일: **2026-08-28** (KST 보정 `gn()` — `getTime() + tzOffset*60000 + 32400000`)
- 상태 저장: Zustand persist, `localStorage['hanbit-coolmessenger-mock']` (`R` 스토어, `Pn` 초기값)

---

## A. 기능 인벤토리 (창 종류별)

앱은 하나의 "데스크톱"(`di`) 위에 창(`window.kind`) 들을 띄운다. 창 종류:
`login | main | inbox | compose | about | settings | person | notice | alert`.

### 데스크톱 셸 — `di`, `Bn`(창 프레임), 작업표시줄

| 기능 | 동작 |
|---|---|
| 배경 | `#6eafd4` + 상단 radial-gradient. |
| 창 프레임 `Bn` | 타이틀바 드래그 이동, 8방향 리사이즈 핸들(`zn`), 더블클릭 최대화, 최소/최대/닫기/도움말/설정/폴더 버튼(창마다 `buttons` 배열로 선택). `An` 에 창별 최소 크기. |
| z-order | `zTop` 증가, 클릭 시 `focusWindow` 가 맨 위로. |
| 작업표시줄 | 하단 고정 바(`#3b97cb`), 열린 창 목록 버튼(메신저/메시지/제목), 오프라인 표시(`navigator.onLine`). |
| 토스트 | 우하단, `pushToast(title, body)`, 7초 자동 소멸, 클릭하면 관리함 열림. |
| 데모 라이브 쪽지 | 로그인 7초 후 `arriveDemo()` — `cn`(남유나 "지금 2학년 연구실로…") 을 받은편지함에 추가 + 토스트. |
| 반응형 | `window.innerWidth < 720` 이면 main 창 자동 최대화, 레이아웃 축소(`Nn`). |
| 종료 | Neutralino 창이면 `app.exit()`, 아니면 창만 닫음. |

### 로그인 창 — `Un`

- 필드: **서버 IP**(`i2`, 초기 `10.80.12.50`), **이름**(초기 `김서준`), **비밀번호**(`••••••••` 표시, 아무 값이나 통과).
- **자동로그인** 체크박스 (`autoLogin`, persist).
- 우측 보조 버튼: **"쿨메신저 통신 검사"** → alert 창(`${ip} 서버 응답 정상 (지연 12ms) / 학내망 모의 구간입니다.`),
  **"절전 모드 확인"** → alert(`현재 절전 모드는 해제되어 있습니다.`).
- 제출 시 `서버에 연결하는 중…` 420ms 후 `login()` → main 창을 최대화 상태로 생성.
- 하단: `해커톤 모의환경 · 개인정보 익명 처리`, `HANBIT LAB`.
- 타이틀바 버튼: 폴더(→ alert "모의 환경입니다. 대화와 별표는 이 브라우저에만 저장됩니다."), 도움말(→ about), 닫기.

### 메인 창 — `lr`

- **헤더**(`cm-header`, `#4aa8dc`): 펭귄 아바타(56px), 이름 `2-3 (132)`, **상태 드롭다운** `cr` =
  `available:수신가능 / away:자리비움 / busy:다른 용무 중 / offline:수신거부` (persist `presence`).
- **헤더 우측 아이콘 4개**: 자료실(→ link 탭), 학사일정(→ calendar 탭),
  **메시지 관리함**(→ inbox 창, 안읽음 수 빨강 뱃지 `ur`), 저장(→ memo 탭). + 색상 테마 버튼(→ settings).
- **툴바**: `조직도 ▾` 버튼, 검색 입력(`이름(아이디) 또는 그룹명 검색`), 조직도 아이콘,
  **정렬 select** `org:정렬 / name:이름순 / ext:내선순`, **크기 select** `sm:작게 / md:크기 / lg:크게`.
- **좌측 세로 탭** `sr` (8개) + 우측 콘텐츠. **하단 회전 배너** `dr` (아래 참조).
- 타이틀바 버튼: 도움말(→ about), 설정(→ settings), 최소, 최대, 닫기.

#### 사이드바 탭 `sr`

| id | 라벨 | 컴포넌트 | 내용 |
|---|---|---|---|
| `org` | 조직도 | `Jn` / `qn` | 트리(한빛중학교 > 10그룹 > 인물). 인물마다 체크박스 + 상태 아이콘(`Hn`: online/offline/pc). 더블클릭 → 쪽지 쓰기, 우클릭 → 인물 카드. 검색 필터링(`Kn`), 이름/내선 정렬 시 평면 목록. 하단: `N명 선택` + `쪽지 보내기` 버튼. |
| `notice` | 공지 | `er` | 공지 4건(`ln`), `공지` 뱃지(pinned), 클릭 → notice 상세 창. |
| `survey` | 설문 | `tr` | 쿨투표 2건(`un`). 옵션 클릭 시 투표(1회, persist `surveyVotes`), 진행률 바 + %. |
| `memo` | 메모 | `nr` | 메모 CRUD (persist `memos`). 좌: 목록 + 새 메모 폼(제목/내용), 우: 선택 메모 인라인 편집 + 삭제. 초기 1건 `2-3 동의서 미제출`. |
| `link` | 링크 | `rr` | 외부 링크 6개(`fn`): 나이스/서울시교육청/에듀넷·티-클리어/위두랑/커리어넷/학생건강정보센터. 새 탭. |
| `calendar` | 학사일정 | `ir` | 2026년 8월 미니 캘린더(월~토 7열), 일정 10건(`dn`) 색점(blue/red/green/amber), 24일 강조. |
| `call` | 콜알림톡 | `ar` | 안내문만 ("부재중 전화 알림은 학내 교환기와 연동됩니다…"). |
| `sms` | 문자 | `or` | 받는 사람 + 내용(최대 90자, 카운터), `전송` → "모의 전송되었습니다. 실제 문자는 발송되지 않습니다." |

### 메시지 관리함 창 — `Ir`

- 타이틀: `메시지 관리함 (N개의 받은 메시지)`.
- **받은메시지 / 보낸메시지** 탭(`Rr`), `folder` 상태.
- **`전체 메시지 ▾`** 드롭다운 필터: `all 전체 / unread 안 읽은 / starred 별표 / attach 첨부 있는`.
- 검색 select(`내용/이름/제목`) + 검색어(`msgQuery`), `상세검색` 버튼(미구현 표시),
  **메시지 다운로드** 아이콘(`Lr`, → 다운로드 모달), **삭제** 아이콘.
- **스플리터**(`fr`, 기본 42%) — 좌: 목록(`zr`), 우: 상세(`Ur`).
- 목록 `zr`: 컬럼 `별표 | 보낸사람 | 제목 | 날짜/시간 ▾ | 첨부파일`, **컬럼 너비 드래그 리사이즈**(`Vr`, persist `columnWidths`),
  안읽음 강조, 별표 토글(`Br`), 그룹 첨부는 `그룹파일`, 태그(`#2026학년도`) 표시. 빈 목록 → `메시지가 없습니다.`
- 상세 `Ur`: 헤더(제목/보낸사람/받는사람 chip `N`개 + `more`/참조/없음), 본문 툴바(`본문내용 (크롬에디터)`,
  확대 `90/100/125/150%` — settings 의 `fontScale` 와 곱해짐), 첨부 다운로드 칩(`Gr`, X/P/H 아이콘),
  하단 액션: **인쇄**(`window.print`) / **회신** / **전체 회신** / **전달** / **저장**(.txt Blob) / **메모저장** / **삭제** / **닫기**.
- `forwardedNote` (예: "부재중 수신된 내용입니다.") 는 본문 위에 회색으로.

### 쪽지 쓰기 창 — `Xr`

- 페이로드: `to`(콤마 구분 id), `cc`, `subject`, `quote`(원문 인용 id). sessionStorage `cm-compose-payload` 로 창 간 전달.
- 받는사람 / 참조: **이름 자동완성**(`Qr`, `y2` 로 이름/직함/내선 검색, 최대 8개), 선택 시 chip, chip 클릭 → 제거.
- 제목, 본문 textarea (`내용을 입력하세요. Ctrl+Enter로 전송`).
- `보내기` → 받는사람 0명이면 alert, 아니면 `sendMessage` (folder `sent`, `isGroup = toIds.length > 3`) + 토스트 + 관리함으로.
- 회신/전달 프리필: `qr()` — 전체회신은 `from + toIds`, 참조 유지, 제목 `RE:`/`FW:` 프리픽스, `----- 원문 -----` 블록.

### xls 다운로드 모달 — `Nr`  ⭐ (`server/python` 실제 내려받기와 대응)

- 트리거: 관리함 툴바의 다운로드 아이콘.
- **기간**: `YYYY-MM-DD` 입력 2개(`Fr`) — 숫자만 받아 자동 하이픈, 초기값 = (이번 달 -1개월 1일) ~ 오늘.
- **저장 폴더**: Neutralino `os.showFolderDialog('저장 폴더 선택')`, 없으면 `os.getPath('desktop')`,
  그것도 없으면 `C:\Users\김서준\Desktop`. `폴더변경` 버튼.
- 파일명: `gr()` = `coolmsg_YYYY_MM_DD.hh.mm.ss` + `.xls`.
- 경고문: `해당 기간의 메시지를 다운로드 하시겠습니까?` / `메시지 양에 따라 다운로드 시간이 길어질 수 있습니다.`
- 생성(`Tr`): 기간 내 메시지를 받은/보낸으로 나눠 **SpreadsheetML(Excel XML) 워크시트 2개** — E절 참조.
- 저장(`Dr`): Neutralino `filesystem.writeFile` (앞에 `\uFEFF` BOM) → 성공 시 `os.showMessageBox`,
  실패/런타임 없음 → 브라우저 Blob 다운로드(`Er`, `application/vnd.ms-excel;charset=utf-8`).

### 기타 창

| 창 | 컴포넌트 | 내용 |
|---|---|---|
| 인물 카드 | `ti` | 아바타, 이름, 직함·내선·room, 상태(온라인/오프라인/PC), 소속, `쪽지 보내기`. |
| 공지 상세 | `ni` | 제목, 보낸사람·날짜, 본문. |
| about | `$r` | `CoolMessenger GENTOO`, `ver. 5.75.80.2 · 해커톤 모의환경`, 설명문. |
| 환경설정 | `ei` | **글자 크기** 슬라이더 90–130% (persist `fontScale`), **데모 초기화**(`resetDemo`), **로그아웃**. |
| alert | `ri` | 페이로드 `text` 표시 + `확인`. |

### 창 간 동기화 — `Dn` / `On`

읽음·삭제·수신 상태 변경 시 `Dn()` 호출 → (1) `localStorage['cm-sync'] = Date.now()`,
(2) `BroadcastChannel('cm-sync').postMessage('sync')`, (3) Neutralino `events.broadcast('cm-sync')`.
`On()` 은 `storage` 이벤트 + BroadcastChannel + Neutralino 이벤트 + (Neutralino일 때) 400ms 폴링 으로
수신해서 `In()` 이 localStorage 에서 상태를 다시 읽어 스토어에 반영. → 관리함을 별도 OS 창으로 띄워도 동기화됨.

### Neutralino 멀티창 — `wn` / `vn`

`openWindow('inbox'|'compose')` 는 Neutralino 런타임이 있으면 `window.create('/?view=inbox', …)`
로 **실제 OS 창** 을 띄운다(`xn` 에 크기). `vn()` 이 `?view=` 로 진입점을 판별해 해당 창만 렌더(`di`).
런타임 없으면 앱 내부 창으로 폴백.

---

## B. 디자인 토큰

`styles.css` 의 Tailwind v4 `@theme`. widget-demo(`apps/coolmessenger-widget-demo/tailwind.config.js`) 는
`cool-*` / `win-*` 팔레트를 따로 쓴다 — 값이 **미묘하게 다르므로** 정렬 시 레퍼런스 값으로 통일 권장.

| 토큰 | 값 | 용도 | widget-demo 대응 |
|---|---|---|---|
| `--color-cm-header` | `#4aa8dc` | 메인/관리함 헤더 파랑 | `cool-400` = 동일 `#4aa8dc` |
| `--color-cm-blue` | `#3b8fd4` | 강조 파랑 | `win.header` `#3b92cb` (다름) |
| `--color-cm-blue-hover` | `#3482c4` | 버튼 hover | — |
| `--color-cm-select` | `#3a8bc8` | 선택 행 | `win.selected` `#cce8ff` (다름) |
| `--color-cm-red` | `#e31c23` | GENTOO 로고, 마감 | — |
| `--color-cm-star` | `#f5a623` | 별표/amber | — |
| `--color-cm-status` | `#2ea38a` | 상태 뱃지 | — |
| `--color-win-ink` | `#222` | 본문 텍스트 | `win.text` `#222222` = 동일 |
| `--color-win-muted` | `#6b7280` | 보조 텍스트 | `win.muted` `#666666` (다름) |
| `--color-win-line` | `#d8d8d8` | 구분선 | `win.border` `#d0dbe5` (다름) |
| `--color-win-chrome` | `#f3f3f3` | 툴바/헤더 셀 배경 | — |
| `--color-win-soft` | `#f5f5f5` | hover 배경 | `win.hover` `#e5f3fc` (다름) |
| `--color-win-sidebar` | `#ececec` | 스플리터 | — |
| `--color-win-border` | `#9aa0a6` | 팝오버 테두리 | `win.border` `#d0dbe5` (다름) |
| `--color-link-blue` | `#1a5fb4` | 링크 | — |
| `--color-banner-green` | `#2e7d32` | 배너 kicker | — |
| `--color-due-red` | `#d0121a` | 마감 강조 | — |
| `--color-taskbar` | `#e8eaed` | (미사용?) | — |

커스텀 클래스(styles.css): `win-frame` `win-in` `win-titlebar` `win-titlebar-btn` `win-toolbar-btn`
`cm-header` `cm-side` `cm-side-item` `cm-login-input` `cm-login-btn` `msg-row` `msg-body` `org-row`
`banner-market` `banner-vote` `banner-travel` `resize-handle` `col-resizer` `chip` `toast-in`.

폰트: 앱은 시스템 기본. widget-demo 는 `Malgun Gothic` 스택 지정 — 유지해도 무방.

---

## C. 시드 데이터 개요

번들 내 배열(`bundle.pretty.js`) → widget-demo `src/data/initialData.js` 로 매핑할 때 스키마 차이 주의.

| 레퍼런스 | 개수 | 심볼 | widget-demo 대응 | 스키마 차이 |
|---|---|---|---|---|
| 교직원 | 48 | `$t` | `SCHOOL_MEMBERS` (48, 거의 동일) | 레퍼런스는 `department` 없음, `status` 값 `online/offline/pc` |
| 조직도 | 10그룹 | `tn` | `ORG_STRUCTURE` (동일 구조) | 레퍼런스는 `g-support` 에 `p-junhyuk` 포함, 노드가 `I(id)` 헬퍼로 생성 |
| 첨부 | 8 | `rn` | 메시지 내 인라인 | `{id, name, sizeLabel, href, kind}` vs widget `{name, size, ext}` |
| 받은 쪽지 | 24 (`m-01`~`m-24`) | `sn` | `INITIAL_MESSAGES` (6개뿐, 내용도 다름) | **큰 차이** — 아래 |
| 보낸 쪽지 | 4 (`m-s1`~`m-s4`) | `sn` | 없음 | folder `sent` |
| 라이브 쪽지 | 1 | `cn` | 없음 | 7초 후 도착 |
| 공지 | 4 | `ln` | 없음 | `{id, title, fromId, dateLabel, pinned, body}` |
| 설문(쿨투표) | 2 | `un` | 없음 | `{id, title, fromId, due, options:[{id,label,votes}]}` |
| 학사일정 | 10 | `dn` | `INITIAL_SCHEDULE_EVENTS` (8, AI추출 위주) | 레퍼런스 `{id, date, title, color}` — 단순, 시간·카테고리 없음 |
| 링크 | 6 | `fn` | 없음 | `{id, label, desc, href}` |
| 배너 | 3 | `pn` | 1개 하드코딩 | `{id, kicker, title, sub, tone: market/vote/travel}` |

**메시지 스키마 (레퍼런스 `sn`)**:
```
{ id, folder:'inbox'|'sent', fromId, toIds:[], ccIds:[], subject, preview,
  bodyHtml, forwardedNote?, dateLabel:'YYYY/MM/DD HH:mm:ss', ts:<epoch ms>,
  attachments:[rn.*], isGroup:bool, unread:bool, starred:bool, tags?:['#..'] }
```
widget-demo 는 여기에 `timestamp`(ISO 문자열), `aiDetectedEvent` 를 더 갖는다.
정렬 시: `ts`(epoch) 를 정식 필드로, `dateLabel` 은 `YYYY/MM/DD HH:mm:ss` 포맷 통일.
레퍼런스 시드 24건은 **개학 첫 주 실제감 있는 학교 쪽지**(동의서/을지연습/건강검진/시간표/급식/상담주간/
전자칠판 장애/교환기 점검/스포츠클럽 출석부…) — schedule-engine 테스트 입력으로 그대로 유용.

**본문 HTML 관용구**: `<p class="due">…까지</p>` (마감), `<p class="hl">` / `<b class="hl">` (강조),
`<p class="item">` (항목). styles.css 에 대응 스타일 있음.

---

## D. 패리티 표 (widget-demo 정렬 백로그)

`apps/coolmessenger-widget-demo/src` 기준. 상태: ✅있음 / 🔶다름 / ❌없음. 우선순위 H/M/L.

| # | 레퍼런스 기능 | 상태 | 우선 | 메모 |
|---|---|---|---|---|
| 1 | 데스크톱 창 관리자 (드래그/리사이즈/z-order/작업표시줄) | 🔶 | M | widget 은 `WindowFrame`/`Desktop`/`Taskbar` 있으나 고정 위치·리사이즈 없음. `Bn` 의 8방향 핸들·최대화 참고. |
| 2 | 독립 로그인 창 (`Un`) | ❌ | M | widget 은 로그인 없이 바로 메인. `쿨메신저 통신 검사` 등 소품까지. |
| 3 | 조직도: 상태 아이콘 3종(online/offline/pc), 정렬 org/name/ext, 크기 sm/md/lg | 🔶 | H | widget `OrgTree` 는 정렬/크기 옵션 UI만 있고 미동작. `Hn`/`qn`/`Jn` 참고. |
| 4 | 사이드바 탭 실제 콘텐츠 — 공지/설문/링크/콜/문자 | ❌ | H | widget 은 탭 8개 있으나 `schedule/talk/sms` 만 연결, 나머지 빈 껍데기. `er/tr/rr/ar/or` + 시드 `ln/un/fn`. |
| 5 | 학사일정 미니 캘린더 (`ir`) | 🔶 | M | widget 은 `MiniCalendar` 를 위젯에서 씀. 메신저 사이드바 탭에도 필요. |
| 6 | 메모 탭 CRUD + persist (`nr`) | ❌ | M | 시드 `memo-1`. |
| 7 | 하단 회전 광고 배너 3종 6초 (`dr`) | 🔶 | L | widget 은 배너 1개 하드코딩. `pn` 3종 + tone 클래스. |
| 8 | 메시지 관리함: 받은/보낸 탭 | 🔶 | H | widget 은 받은편지함 위주. `sent` folder + `m-s*` 시드. |
| 9 | 관리함 필터 드롭다운 (전체/안읽음/별표/첨부) | ✅ | – | widget `MessageList` 유사 필터 존재 — 확인만. |
| 10 | 관리함 컬럼 너비 드래그 리사이즈 + persist | ❌ | L | `Vr` / `columnWidths`. |
| 11 | 목록/상세 스플리터 (`fr`) | 🔶 | L | widget 은 고정 분할. |
| 12 | 상세: 회신/전체회신/전달/인쇄/저장(.txt)/메모저장 | 🔶 | M | widget `MessageDetail` 액션 일부만. `qr`/`Jr`. |
| 13 | 본문 확대 90~150% × settings fontScale | ❌ | L | |
| 14 | 쪽지 쓰기: 이름 자동완성 chip (`Qr`) | 🔶 | M | widget `ComposeModal` 확인 필요. |
| 15 | 회신/전달 원문 인용 프리필 (`qr`) | 🔶 | M | `RE:`/`FW:` + `----- 원문 -----`. |
| 16 | **xls 다운로드 모달**: 기간 입력, 폴더 선택, SpreadsheetML 2시트 | 🔶 | H | widget `DownloadModal` 은 progress bar + confetti 연출뿐, 실제 파일/포맷 없음. E절 스펙대로. `server/python/ingest.py` 실제 내려받기 포맷과 맞추기. |
| 17 | 파일명 규칙 `coolmsg_YYYY_MM_DD.hh.mm.ss.xls` (`gr`) | ❌ | H | widget 은 폴더명만 `coolmsg_2026`. |
| 18 | 창 간 동기화 (BroadcastChannel + storage + 폴링) | ❌ | M | `Dn`/`On`/`In`. 데스크톱 캘린더 위젯 동기화(`widgetSync.js`) 와 통합 여지. |
| 19 | Neutralino 멀티창 팝아웃 (`?view=inbox`) | ❌ | L | 데스크톱 배포 시에만. widget 은 `desktopWidgetLauncher` 로 별창 이미 함. |
| 20 | Zustand persist (`hanbit-coolmessenger-mock`) | 🔶 | M | widget 은 `storageService.js` 사용 — 키/스키마 정리. |
| 21 | 상태(presence) 4종 + persist | 🔶 | L | widget 은 3종(online/away/busy), `offline:수신거부` 없음. |
| 22 | 데모 초기화 / 7초 후 라이브 쪽지 | 🔶 | L | widget 은 `resetDemo` 유무 확인. |
| 23 | 시드: 받은 24 + 보낸 4 + 라이브 1 (`sn`/`cn`) | 🔶 | H | widget 은 6건. 레퍼런스 24건으로 교체/병합 → schedule-engine 입력 풍부해짐. |
| 24 | 시드: 공지 4 / 설문 2 / 링크 6 / 배너 3 | ❌ | H | `ln`/`un`/`fn`/`pn` 를 `initialData.js` 로. |

widget-demo 에만 있고 레퍼런스엔 없는 것(유지): AI 스마트 비서·브리핑(`aiAssistant/*`), 일정 위젯(`scheduleWidget/*`),
데스크톱 캘린더 위젯(`desktopWidget/*`), 그룹 채팅(`GroupChatWindow`), 모바일 셸(`MobileShell`),
schedule-engine 연동(`services/*`). → 레퍼런스 정렬이 이들을 깨지 않도록 주의.

---

## E. xls 내보내기 스펙 (`Tr` / `wr` / `Cr`)

`Tr(messages, startDate, endDate)` 가 반환하는 문자열 = **SpreadsheetML 2003 (Excel XML)**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="hdr"><Font ss:Bold="1"/><NumberFormat ss:Format="@"/></Style>
  <Style ss:ID="txt"><NumberFormat ss:Format="@"/></Style>
 </Styles>
 <Worksheet ss:Name="받은메시지"><Table> …헤더행 + 데이터행… </Table></Worksheet>
 <Worksheet ss:Name="보낸메시지"><Table> …헤더행 + 데이터행… </Table></Worksheet>
</Workbook>
```

- 파일: BOM(`\uFEFF`) + 위 XML, 확장자 `.xls`, MIME `application/vnd.ms-excel;charset=utf-8`.
- 받은메시지 컬럼: `구분 | 보낸사람 | 제목 | 날짜/시간 | 내용 | 첨부파일`
- 보낸메시지 컬럼: `구분 | 받은사람 | 제목 | 날짜/시간 | 내용 | 첨부파일`
- `구분` = `중요 메시지`(starred) / `일반 메시지` (`yr`).
- `보낸사람`/`받은사람` = `이름(직함,내선)(이름)` 형식 (`mn(id, true)`), 다중 수신자는 `; ` 조인.
- `날짜/시간` = `YYYY/MM/DD HH:mm:ss (요일)` (`br`).
- `내용` = bodyHtml 태그 제거 + 엔티티 복원 + 개행 정리 (`vr` / `Sr`).
- 기간 필터: `ts >= start.getTime() && ts <= end.getTime() + 86400000 - 1`.
- XML 이스케이프(`_r`): `& < > "` 만. (셀 값에 제어문자 주의.)

이 포맷은 **실제 쿨메신저가 내보내는 xls 와 유사하게** 만든 것. `server/python/ingest.py` +
`server/python/parser.py` 가 실제 쿨메신저 창에서 받아오는 xls 를 파싱하고,
`packages/schedule-engine` 이 그 파싱 결과에서 일정 후보를 뽑는다 — 셋의 컬럼/헤더를 맞춰두면
목업 다운로드본을 엔진 테스트 픽스처로 바로 쓸 수 있다 (`packages/schedule-engine/RULES.md`,
루트 `README.md` "일정 추출 규칙은 한 곳에만" 참조).
