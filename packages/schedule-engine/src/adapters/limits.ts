/** 안전 한도 (PRD 6장 예외 처리 / 기술계획서 6장). 넘으면 부분 결과를 쓰지 않고 오류를 낸다. */
export const LIMITS = {
  maxFileBytes: 100 * 1024 * 1024,
  maxSheets: 16,
  maxRowsPerSheet: 50_000,
  maxCellChars: 100_000,
  /** ss:Index 로 열을 건너뛸 수 있는 최대 열 번호 */
  maxColumns: 256,
} as const;

export class WorkbookLimitError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "WorkbookLimitError";
  }
}
