/**
 * 민감정보 탐지·마스킹 (PRD 8장).
 *
 * 목표는 Recall 99%다. 애매하면 «민감»으로 보고 후보에서 빼는 쪽이 안전하다.
 * 마스킹은 중복 제거(지문 계산) **뒤에** 해야 한다. 먼저 마스킹하면 서로 다른 두 쪽지가
 * 같은 placeholder로 바뀌어 같은 지문이 되고, 다른 내용이 하나로 합쳐진다 (기술계획서 7.2).
 */

export type SensitiveKind =
  | "주민등록번호"
  | "전화번호"
  | "계좌번호"
  | "비밀번호"
  | "학번"
  | "건강·상담"
  | "주소";

export interface SensitiveHit {
  kind: SensitiveKind;
  /** 마스킹 전 값의 길이만 남긴다. 값 자체는 담지 않는다. */
  length: number;
  index: number;
}

export interface SensitiveResult {
  hits: SensitiveHit[];
  masked: string;
  /** 격리 대상인가. 주민번호·계좌·비밀번호가 보이면 후보를 만들지 않는다. */
  quarantine: boolean;
}

interface Detector {
  kind: SensitiveKind;
  re: RegExp;
  mask: string;
  /** 이 종류가 보이면 쪽지 자체를 격리한다 */
  quarantine: boolean;
  /** 오탐을 걸러내는 추가 조건 */
  accept?: (match: RegExpMatchArray, text: string) => boolean;
}

/** 앞뒤가 날짜 문맥이면 계좌·학번으로 보지 않는다. */
function looksLikeDate(text: string, index: number, length: number): boolean {
  const around = text.slice(Math.max(0, index - 6), index + length + 6);
  return /\d{4}\s*[-./]\s*\d{1,2}\s*[-./]\s*\d{1,2}/.test(around) || /[년월일시분]/.test(around);
}

const DETECTORS: Detector[] = [
  {
    kind: "주민등록번호",
    re: /(?<!\d)\d{6}\s*-\s*[1-4]\d{6}(?!\d)/g,
    mask: "[주민번호]",
    quarantine: true,
  },
  {
    kind: "전화번호",
    re: /(?<!\d)(01[016-9]|0\d{1,2})[-\s.]?\d{3,4}[-\s.]?\d{4}(?!\d)/g,
    mask: "[전화번호]",
    quarantine: false,
    // 내선 3자리(114 등)와 날짜는 제외한다.
    accept: (m, text) => m[0].replace(/\D/g, "").length >= 9 && !looksLikeDate(text, m.index ?? 0, m[0].length),
  },
  {
    kind: "계좌번호",
    // 은행 계좌는 보통 세 덩이 이상이고 전체 자릿수가 10자리를 넘는다.
    re: /(?<![\d-])\d{2,6}-\d{2,6}-\d{2,7}(?![\d-])/g,
    mask: "[계좌번호]",
    quarantine: true,
    accept: (m, text) => {
      const digits = m[0].replace(/\D/g, "");
      if (digits.length < 10) return false;
      // 2026-08-24 같은 날짜와 010-1234-5678 같은 전화번호는 계좌가 아니다.
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(m[0])) return false;
      if (/^01[016-9]-/.test(m[0])) return false;
      return !looksLikeDate(text, m.index ?? 0, m[0].length);
    },
  },
  {
    kind: "비밀번호",
    // "비밀번호는 1234" 처럼 값이 따라오는 경우만 잡는다. 단어만 나오면 격리하지 않는다.
    re: /(비밀번호|비번|패스워드|password|초기\s*비번)\s*(?:는|은|:|：)?\s*[\w!@#$%^&*()-]{4,}/gi,
    mask: "[비밀번호]",
    quarantine: true,
  },
  {
    kind: "학번",
    // 5자리 학번. 학년-반-번호가 붙은 형태이므로 앞자리가 1~6이어야 한다.
    re: /(?<!\d)[1-6]\d{4}(?!\d)/g,
    mask: "[학번]",
    quarantine: false,
    accept: (m, text) => !looksLikeDate(text, m.index ?? 0, m[0].length),
  },
  {
    kind: "건강·상담",
    re: /진단서|병가|입원|수술|우울|자해|자살|정신과|심리\s*상담|학대|피해\s*학생|가해\s*학생/g,
    mask: "[상담·건강]",
    quarantine: true,
  },
];

export function detectSensitive(text: string): SensitiveResult {
  interface Replacement {
    start: number;
    end: number;
    mask: string;
    kind: SensitiveKind;
  }

  const replacements: Replacement[] = [];
  const hits: SensitiveHit[] = [];
  let quarantine = false;

  for (const det of DETECTORS) {
    for (const m of text.matchAll(det.re)) {
      const index = m.index;
      if (det.accept && !det.accept(m, text)) continue;
      // 이미 다른 규칙이 잡은 구간이면 건너뛴다.
      if (replacements.some((r) => index < r.end && r.start < index + m[0].length)) continue;

      replacements.push({ start: index, end: index + m[0].length, mask: det.mask, kind: det.kind });
      hits.push({ kind: det.kind, length: m[0].length, index });
      if (det.quarantine) quarantine = true;
    }
  }

  replacements.sort((a, b) => b.start - a.start);
  let masked = text;
  for (const r of replacements) {
    masked = masked.slice(0, r.start) + r.mask + masked.slice(r.end);
  }

  return { hits, masked, quarantine };
}
