/** 쿨메신저 내보내기 파일에서 읽어낸 한 줄. 원문 그대로이며 아직 마스킹 전이다. */
export interface RawMessage {
  /** 시트에서의 방향. 받은메시지 / 보낸메시지 */
  direction: "received" | "sent";
  /** "일반 메시지", "중요 메시지" 등 */
  kind: string;
  /** 보낸사람 또는 받은사람 원문 (예: "최은지(교무부장,107)(최은지)") */
  counterpart: string;
  /** 제목 열. 쿨메신저에서는 대개 본문 첫 줄이 잘린 값이다 (기술계획서 7.3) */
  title: string;
  /** 날짜/시간 열 원문 (예: "2026/08/24 09:32:21 (월)") */
  sentAtRaw: string;
  /** 본문 */
  body: string;
  /** 첨부파일명 */
  attachment: string;
  /** 진단용 위치 정보. 원문은 담지 않는다. */
  origin: { sheet: string; row: number };
}

/** 파일에서 읽어낸 시트 하나. 셀은 전부 문자열로 정규화한다. */
export interface SheetData {
  name: string;
  rows: string[][];
}

export type WorkbookFormat = "ole2-biff" | "zip-xlsx" | "spreadsheetml-2003";

export interface ParsedWorkbook {
  format: WorkbookFormat;
  sheets: SheetData[];
  /** 헤더에서 알아보지 못해 무시한 열 이름. 진단 화면용 (기술계획서 7.1) */
  ignoredColumns: string[];
  /** 건너뛴 행 수 (빈 행, 깨진 행) */
  skippedRows: number;
}

/** 날짜 해석 결과의 정밀도 */
export type TimePrecision = "date_only" | "period" | "exact";

/** 자동등록을 막는 모호 표시 (기술계획서 7.4) */
export type AmbiguityFlag =
  | "날짜·요일 불일치"
  | "연도 생략"
  | "오전·오후 불명확"
  | "종료일 불명확"
  | "반복 주기 불명확"
  | "교시표 미설정"
  | "변경 대상 불명확"
  | "날짜 범위 벗어남"
  | "요일만 적힘"
  | "일과 시각 추정"
  | "날짜 없이 요청만 적힘";

/** 본문에서 찾아낸 날짜 표현 하나 */
export interface DateMention {
  /** 원문에서 매칭된 문자열 */
  text: string;
  /** 문장 내 시작 위치 */
  index: number;
  /** 해석된 시작 시각 (Asia/Seoul 기준 벽시계 값을 담은 ISO 문자열, 초 없음) */
  startAt: string;
  /** 기간 표현일 때의 종료 시각 */
  endAt?: string;
  precision: TimePrecision;
  periodStart?: number;
  periodEnd?: number;
  flags: AmbiguityFlag[];
  /** 어떤 규칙이 이 날짜를 만들었는지 (진단·평가용) */
  rule: string;
}

export type Classification =
  | "OFFICIAL_EVENT"
  | "PERSONAL_TASK"
  | "DEADLINE"
  | "OPTIONAL_EVENT"
  | "REFERENCE_NOTICE"
  | "URGENT_NOTICE"
  | "PERSONAL_CHAT"
  | "ACK_REPLY"
  | "SENSITIVE"
  | "UNKNOWN";

export type RelationType = "new" | "update" | "cancel" | "recurrence";

/** 위젯(역할 2)에 넘겨줄 일정 후보. 이 모양이 팀 간 계약이다. */
export interface Candidate {
  id: string;
  messageId: string;
  proposedTitle: string;
  candidateType: Classification;
  startAt: string | null;
  endAt: string | null;
  dueAt: string | null;
  timePrecision: TimePrecision;
  periodStart: number | null;
  periodEnd: number | null;
  location: string | null;
  /** 사용자가 해야 할 행동 (예: "출석부 제출") */
  actionText: string | null;
  /** 대상 (예: "전 교직원", "2학년 담임") */
  targetText: string | null;
  /** 캘린더에 넣을 핵심 일정 단어 */
  keywords: string[];
  /** 이 판단의 근거. 화면에 그대로 보여줄 수 있는 짧은 문장들 */
  reasoning: string[];
  confidence: number;
  /** 화면에는 숫자 대신 이 세 단계만 보여준다 (PRD 9장) */
  confidenceBand: "높음" | "검토 필요" | "낮음";
  relationType: RelationType;
  ambiguityFlags: AmbiguityFlag[];
  /** 같은 쪽지에서 파생된 후보들을 묶는 값 */
  sourceGroupId: string;
  /** 쪽지를 받은 날 (기준 시각) */
  messageSentAt: string;
  counterpart: string;
  /** 자동 등록 안전 조건을 모두 통과했는지 (PRD 9장) */
  autoRegisterEligible: boolean;
  /** 통과하지 못했다면 그 이유 */
  autoRegisterBlockers: string[];
}
