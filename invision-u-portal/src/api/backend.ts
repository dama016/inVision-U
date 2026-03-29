import { apiFetch } from "@/api/client";
import type {
  AnalyticsSummary,
  ScoreBucketsResponse,
  SubmissionsResponse,
  TopTodayResponse,
} from "@/types/analytics";
import type {
  CandidateDto,
  CandidatesListResponse,
  CommitteeDecision,
} from "@/types/candidate";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await apiFetch("/api/analytics/summary");
  return parseJson(res);
}

export async function fetchSubmissions(
  granularity: "day" | "week" | "month"
): Promise<SubmissionsResponse> {
  const q = new URLSearchParams({ granularity });
  const res = await apiFetch(`/api/analytics/submissions?${q}`);
  return parseJson(res);
}

export async function fetchScoreBuckets(): Promise<ScoreBucketsResponse> {
  const res = await apiFetch("/api/analytics/score-buckets");
  return parseJson(res);
}

export async function fetchTopToday(
  limit = 3
): Promise<TopTodayResponse> {
  const res = await apiFetch(`/api/analytics/top-today?limit=${limit}`);
  return parseJson(res);
}

export async function fetchCandidates(): Promise<CandidatesListResponse> {
  const res = await apiFetch("/api/candidates");
  return parseJson(res);
}

export async function patchCandidateDecision(
  id: string,
  committeeDecision: CommitteeDecision
): Promise<CandidateDto> {
  const res = await apiFetch(`/api/candidates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ committeeDecision }),
  });
  return parseJson(res);
}

export async function submitCandidateApplication(body: {
  essay: string;
  resumeFile: File | null;
}): Promise<CandidateDto> {
  const fd = new FormData();
  fd.append("essay", body.essay);
  if (body.resumeFile) fd.append("resume", body.resumeFile);
  const res = await apiFetch("/api/candidates", {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text || res.statusText;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* use raw text */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<CandidateDto>;
}
