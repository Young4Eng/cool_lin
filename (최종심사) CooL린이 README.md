[Cool린이_README (2).md](https://github.com/user-attachments/files/31580178/Cool._README.2.md)
# Cool린이

> 쿨메신저 스마트 일정 정리 위젯

[🌐 바로 사용하기](https://drive.google.com/drive/folders/1oUAS3mB_1L5ircwTO6ubUscRHvnOpStW?usp=drive_link) [💻 소스코드](https://github.com/Young4Eng/cool_lin) [▶️ 시연 보기](https://youtu.be/RvWGLzAPI6o)

## 대표 화면과 링크

![대표 화면](https://dutmlwajdhdbjmdijefy.supabase.co/storage/v1/object/sign/post-images/comment-347f5b99-e1f5-41d6-b90b-0764175a0087.jpg?token=eyJraWQiOiI4ZmZiMjFmMC1hMjhmLTRiM2QtODJlMi1jYjJiNDgxNTBmYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0LWltYWdlcy9jb21tZW50LTM0N2Y1Yjk5LWUxZjUtNDFkNi1iOTBiLTA3NjQxNzVhMDA4Ny5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg3OTY4NDE1LCJleHAiOjIxMDMzMjg0MTV9.CNTvVb-4K7ICjazXkrvEmcJQ7NmCCYMtnAC5ecWYR94)

## 최종적으로 해결한 문제

교사들이 매일 쏟아져오는 쿨메신저 때문에 일정 관리가 힘들다. 놓치는 업무가 종종 있다. (인터뷰 11명 중 8명 언급. 필요성 1등)

### 어떻게 풀었나요?

메신저 분석 후 자동으로 일정표에 저장해주는 위젯 로컬 AI 캘린더 위젯

## 핵심 기능

- **메신저 속 일정 자동 관리**: 자동 매크로를 활용하여 자동으로 메신저 속 일정을 추출해 직접 제작한 일정 위젯에  반영합니다.
- **할 일 자동 리마인드**: 일정을 까먹지 않도록 위젯 일정에 디데이가 써 있으며, D-3일부터 D-DAY까지는 위젯과 별도로 우측 하단 PC상 윈도우 알림 팝업

## 사용 흐름과 사용 방법

1. 1. 교사가 PC를 켜면 자동으로 일정 위젯이 뜬다.
2. 2. 사용자가 쿨메신저에 로그인을 한다.(켠다)
3. 3. 위젯에 '자동정리 기간'을 설정하면 메신저 속 일정들을 매크로가 자동 분류 및 일정을 위젯 속 캘린더에 저장합니다. (+수동으로도 추가 가능)
4. 4-1. 필요 시 추가로 할 일 추가/다 한 할 일은 체크표시/ 중요한 일정에는 별표 표시
5. 4-2. 필요 시 구글 캘린더 연동 아이콘을 클릭하면 구글 캘린더에 연동이 된다.
6. 4-3. 일정 위젯 속 정리된 거에서 원래 메신저 내용 확인하고 싶으면 더블클릭 시 원래 메시지 떠서 확인 가능 
7. 4-4. 일정마다 하단에 AI로 3줄 이내 요약이 떠서 쉽게 확인 가능
8. 4-5. 필요 시 왼쪽 가장자리 클릭하면 캘린더 크기가 확장되어  일정 바가 길게 보여서 UI 보기 쉽게 수정

- 사용 환경: 데스크톱 앱
- 사용 조건: - python-3 필수 (배포 파일에 함께 연동하였으나, 보완 필요), Ollama 선택  
-발표 PPT: https://canva.link/coollin  
-최신 파일로 다운받아주세요.

## 기술 스택과 실행 방법

- **화면**: React
- **서버·백엔드**: - (개인 pc)
- **AI**: Ollama
- **저장소**: 브라우저 로컬 저장소
- **배포**: 직접 설치

### 폴더 구조

```text
client/                                 React + Vite (개발용 화면)
server/                                 Express + TypeScript (개발용 API)
server/python/                          쿨메신저 내려받기 자동화
packages/schedule-engine/               일정 추출 규칙 엔진
  src/
  RULES.md
apps/coolmessenger-widget-demo/         설치형 데모(화면+위젯)
  src/
    components/
    services/
    hooks/
    data/
    utils/
  src-tauri/                            Tauri 2 셸
docs/
설치.bat
사용설명.txt
```

### 설치와 실행

```bash
npm run install:all
npm run dev
```

- 필요한 환경변수(이름만): PORT LOCAL_AI_INGEST OLLAMA_URL OLLAMA_MODEL OLLAMA_TIMEOUT_MS

## 작동 범위와 한계, 다음 계획

- 지금까지 확인한 범위: 세 명의 팀원 모두에게 설치 파일 다운로드 시 실행이 정상 작동.

### 기술적 한계

- 실제 쿨메신저와 연동하는지 확인 필요하다.

### 다음 계획

- 실제 쿨메신저와 연동한다.  
업무를 타인과 공유하고 공동 관리하는 기능을 추가한다.

## 교육 현장에서 사용할 때의 주의사항

- **개인정보 처리 여부**: 처리하지 않음
- **예상되는 위험**: 교사 개인 컴퓨터 로컬 AI에서만 처리하기 때문에 외부에 유출되지 않아 문제 없음
- **위험을 줄이려고 한 일**: 교사 개인 컴퓨터에서만 처리
- **멈춤 기준**: 교사 개인 컴퓨터에서만 처리
- **검증 방법**: 자체 보안 테스트 확인(외부에 데이터가 나가지 않는 지 여부)

### 입력·전송·저장 정보

- 쿨메신저 쪽지 내보내기 파일(.xls) — 파일 가져오기(자동 연결) — 전송하지 않음
- 마스킹된 쪽지 본문(원문 아님) — 앱이 내보내기 파일에서 추출 — 전송하지 않음
- 일정 후보·확정 일정(제목, 날짜, 요약) — 앱이 규칙으로 추출 후 교사가 확인 — 전송하지 않음
- 위젯·알림·역할 설정(담임 여부 등, 이름 아님) — 교사 본인 — 전송하지 않음
- 쪽지 속 민감정보(이름·학번·전화번호 등) — 입력받지 않음(쪽지 원문에 있을 수 있음) — 전송하지 않음

### 교육적 태도 점검

- 평가·추천·피드백을 프로그램이 대신 확정하지 않게 했나요?: 우리 프로그램엔 해당 없어요
- 학생이나 교사의 생각을 대신하지 않게 했나요?: 우리 프로그램엔 해당 없어요
- 저장·전달·제출 전에 사람이 확인할 수 있나요?: 원래 그렇게 했어요
- 기기·계정·조작 문제로 참여에서 빠지는 사람이 없게 했나요?: 우리 프로그램엔 해당 없어요

## 제작자와 라이선스

- 조영욱 · 대명중학교 2학년 · 팀장, 데이터 자동 연결화 기능 구현
- 박세원 · 중앙대학교사범대학부속초등학교 5학년 · 인터뷰, PPT 제작
- 이서영 · 창일중학교 1학년 · 개발, 디버깅
- **코드 라이선스**: MIT
- **문서 라이선스**: CC BY 4.0
- **외부 자료 출처**: 아이콘: Lucide (ISC 라이선스)  
엑셀 파싱: SheetJS Community xlsx (Apache-2.0)  
데스크톱 셸: Tauri 2 (MIT OR Apache-2.0)  
UI 참고: naemo.ai 캘린더 레이아웃  
목업 메신저 레퍼런스: 팀 제작 CoolMessenger GENTOO (Neutralino + React, exe는 미커밋)

## 교사 개발자 윤리 자가점검

- 응답 인원: 3명 / 팀원 3명

| 원칙 | 평균 점수 |
| --- | --- |
| 학생 성장 최우선 | 5.0 / 5.0 |
| 개인정보·데이터 보호 | 5.0 / 5.0 |
| 책임과 출처 존중 | 5.0 / 5.0 |
| 안전한 실험과 검증 | 5.0 / 5.0 |
| 역할 경계 인식 | 5.0 / 5.0 |
| 공공성 | 5.0 / 5.0 |
| 투명성 및 설명 가능성 | 5.0 / 5.0 |
| **전체 평균** | **5.0 / 5.0** |

### 우리가 더한 약속

- 박세원: 언제나 문제상황이 생기면 업데이트 해주는 책임감.
- 이서영: 끝까지 문제생길시 업데이트 해야하는 책임감
- 조영욱: 8. 협업성: 같은 문제 인식을 가진 교사가 함께 협업해, 개별된 작업을 넘어 협럭을 통해 더 나은 결과물 산출하는 태도를 가지는 것
