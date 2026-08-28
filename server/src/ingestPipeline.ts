import type { Candidate } from "@cool-lin/schedule-engine";
import type { ExtractedItem } from "./localAi.js";

export type ExtractResult = {
  candidates: Candidate[];
  stats: Record<string, number> | null;
  error?: string;
};

export type LocalAiIngestResult = {
  ok: boolean;
  items: ExtractedItem[];
  model?: string;
  error?: string;
  warning?: string;
  pii_tokens?: string[];
};

export type AiStatus = {
  ok: boolean;
  error?: string;
  model?: string;
};

export type ExtractAndAiDeps = {
  extractCandidates: (file: string) => Promise<ExtractResult>;
  runLocalAi: (file: string) => Promise<LocalAiIngestResult>;
};

/**
 * 내려받기 결과에 규칙 엔진 후보와 로컬 AI items 를 붙인다.
 *
 * 위젯은 items 를 캘린더 일정으로 쓰고, items 가 비면 candidates 로 폴백한다.
 * Ollama 가 꺼져 있거나 시간 초과여도 추출(ok/file/candidates)은 그대로 성공으로 둔다.
 */
export async function withExtractAndAi(
  data: Record<string, unknown>,
  deps: ExtractAndAiDeps,
): Promise<Record<string, unknown>> {
  const file = typeof data.file === "string" ? data.file : "";
  const extracted: ExtractResult =
    file === ""
      ? { candidates: [], stats: null, error: "파일 경로가 없습니다." }
      : await deps.extractCandidates(file);

  let items: ExtractedItem[] = [];
  let pii_tokens: string[] = [];
  let ai: AiStatus =
    file === ""
      ? { ok: false, error: "파일 경로가 없습니다." }
      : { ok: false, error: "로컬 AI 처리에 실패했습니다." };

  if (file !== "") {
    try {
      const aiResult = await deps.runLocalAi(file);
      items = Array.isArray(aiResult.items) ? aiResult.items : [];
      pii_tokens = Array.isArray(aiResult.pii_tokens) ? aiResult.pii_tokens : [];
      ai = aiResult.ok
        ? { ok: true, model: aiResult.model }
        : {
            ok: false,
            error: aiResult.error ?? "로컬 AI 처리에 실패했습니다.",
            model: aiResult.model,
          };
    } catch (e) {
      items = [];
      pii_tokens = [];
      ai = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return {
    ...data,
    candidates: extracted.candidates,
    extraction: {
      count: extracted.candidates.length,
      stats: extracted.stats,
      error: extracted.error ?? null,
    },
    items,
    ai,
    pii_tokens,
  };
}
