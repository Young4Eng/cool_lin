# CoolMessenger GENTOO — 목업 메신저 레퍼런스

이 폴더는 저장소 루트에 있던 **`CoolMessenger.exe`** 에서 추출한 웹앱 소스다.
프로젝트의 "정답지(reference spec)" 로만 쓴다 — 여기 코드를 그대로 빌드/실행하는 용도가 아니라,
`apps/coolmessenger-widget-demo` (와 나중에 `client`) 의 목업 쿨메신저 UI·동작·시드 데이터를
맞춰 나가는 기준이다.

기능 / 디자인 토큰 / 시드 스키마 / widget-demo 와의 패리티 표는 **[`FEATURES.md`](./FEATURES.md)** 참조.

## 이게 뭔가

- `CoolMessenger.exe` 는 실제 쿨메신저 제품이 **아니다**. 팀원이 만든 완결형 목업
  **"CoolMessenger GENTOO"** 로, 한빛중학교(가상) 교직원 메신저 화면을 외부에서 시험할 수 있게
  만든 복제 UI다. 등장 인물·쪽지·이름은 전부 가명이고 서버에 연결되지 않는다.
- 빌드 스택: **Neutralino**(경량 데스크톱 셸) + **React 19** + **Zustand**(+persist) +
  **Tailwind CSS v4.3.3**, Vite 단일 파일 빌드. 그 `index.html` 을 Neutralino 실행파일에 임베드했다.

## 파일

| 파일 | 설명 |
|---|---|
| `index.html` | exe에서 바이트 그대로 잘라낸 단일 파일 빌드 (375 KB). 인라인 `<style>` + 인라인 번들 `<script>` + `#root`. 원본 무수정. |
| `bundle.pretty.js` | 위 `index.html` 안의 인라인 번들 `<script>` 를 esbuild로 정리한 **읽기 전용** 사본 (약 1만 줄). 실행용 아님, 코드 리딩용. |
| `styles.css` | 위 `index.html` 안의 인라인 `<style>` (Tailwind v4 출력 + `@theme` 디자인 토큰). |

## 브라우저에서 보기

`index.html` 을 브라우저로 바로 열면 된다. `"/js/neutralino.js"` (Neutralino 런타임) 는
exe 밖에 있어서 추출본에 없지만, 앱이 모든 Neutralino 호출을 옵셔널 체이닝으로 감싸 두어서
런타임이 없어도 우아하게 폴백한다:

- **동작함**: 로그인(아무 값이나), 메인 창, 조직도(검색/정렬/크기), 사이드바 탭 8종,
  메시지 관리함(받은/보낸/필터/검색/컬럼 리사이즈/상세/회신·전달·인쇄), 쪽지 쓰기,
  메모 CRUD, 설문 투표, 창 드래그/리사이즈/최대화, 7초 후 데모 쪽지 도착 토스트.
- **no-op / 폴백**: 관리함·작성창을 실제 OS 창으로 분리하는 Neutralino 멀티창(→ 앱 내 창으로 뜸),
  xls를 디스크에 직접 저장(→ 브라우저 Blob 다운로드로 폴백), 폴더 선택 다이얼로그(→ 기본 경로).

Zustand persist 가 `localStorage['hanbit-coolmessenger-mock']` 에 상태를 저장하므로,
초기 상태로 되돌리려면 그 키를 지우거나 환경설정 창의 **"데모 초기화"** 를 누른다.

## exe에서 어떻게 추출했나 (재현 절차)

1. `CoolMessenger.exe` 를 바이트 배열로 읽어 ASCII 로 `"<!DOCTYPE html>"` (오프셋 2691997) 부터
   `"</html>"` (오프셋 3067807) 까지 잘라 `index.html` 로 저장.
2. `index.html` 에서 인라인 `<style>...</style>` → `styles.css`,
   외부 `src` 가 아닌 인라인 `<script>...</script>` → `bundle.raw.js` 로 분리.
3. 저장소에 이미 설치된 esbuild 로 정리:
   ```
   apps/coolmessenger-widget-demo/node_modules/.bin/esbuild bundle.raw.js \
     --line-limit=110 --charset=utf8 > bundle.pretty.js
   ```
   (`--charset=utf8` 없으면 한글이 `\uXXXX` 로 이스케이프됨.)

`bundle.pretty.js` 는 esbuild 가 파싱→재출력한 것이라 원본과 **의미는 같지만 형식이 다르다**.
정확한 바이트가 필요하면 `index.html` 안의 `<script>` 를 본다.

## 주의

- `CoolMessenger.exe` (3 MB PE 바이너리) 자체는 저장소에 커밋하지 않는다 (`.gitignore` 에 있음).
  커밋 대상은 추출한 웹 소스뿐이다.
- 이 목업의 저작권은 만든 팀원에게 있다. 해커톤 내부 레퍼런스 용도로만 사용한다.
