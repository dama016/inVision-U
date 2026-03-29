import { useEffect, useState } from "react";
import { patchCandidateDecision } from "@/api/backend";
import { ResumeViewerModal } from "@/components/committee/ResumeViewerModal";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CandidateDto, CommitteeDecision } from "@/types/candidate";

type CandidateDrawerProps = {
  candidate: CandidateDto | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (c: CandidateDto) => void;
};

export function CandidateDrawer({
  candidate,
  open,
  onClose,
  onUpdated,
}: CandidateDrawerProps) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResumeViewerOpen, setIsResumeViewerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (isResumeViewerOpen) {
        setIsResumeViewerOpen(false);
        return;
      }
      onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, isResumeViewerOpen]);

  useEffect(() => {
    if (!open) setIsResumeViewerOpen(false);
  }, [open]);

  useEffect(() => {
    setIsResumeViewerOpen(false);
  }, [candidate?.id]);

  useEffect(() => {
    if (open) setError(null);
  }, [open, candidate?.id]);

  if (!candidate) return null;

  const c = candidate;
  const ev = c.evaluation;

  function openResumeViewer() {
    if (!c.resumeFileName) return;
    setIsResumeViewerOpen(true);
  }

  const resumeViewUrl =
    c.resumeFileName != null ? `/api/candidates/${c.id}/resume` : null;

  async function applyDecision(next: CommitteeDecision) {
    if (!c || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await patchCandidateDecision(c.id, next);
      onUpdated(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("candError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {resumeViewUrl && c.resumeFileName && (
        <ResumeViewerModal
          open={isResumeViewerOpen}
          onClose={() => setIsResumeViewerOpen(false)}
          resumeUrl={resumeViewUrl}
          fileName={c.resumeFileName}
        />
      )}
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/60 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={() => {
          if (isResumeViewerOpen) return;
          onClose();
        }}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-lg flex-col border-l border-brand-lime/25 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-brand-lime/20 dark:bg-slate-950 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-drawer-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-lime/20 px-5 py-4 dark:border-brand-lime/15">
          <div className="min-w-0">
            <h2
              id="candidate-drawer-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              {c.fullName}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {c.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition-smooth hover:bg-brand-lime/15 hover:text-slate-900 dark:hover:text-brand-lime"
            aria-label={t("btnClose")}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="space-y-3 text-sm">
            <h3 className="font-semibold text-slate-800 dark:text-brand-lime/90">
              {t("candProfile")}
            </h3>
            <dl className="grid grid-cols-1 gap-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t("labelPhone")}</dt>
                <dd>{c.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t("labelIin")}</dt>
                <dd>{c.iin || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t("candApplied")}</dt>
                <dd>
                  {new Date(c.appliedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">{t("candDecisionCurrent")}</dt>
                <dd className="font-medium">{c.committeeDecision}</dd>
              </div>
            </dl>
            {c.resumeFileName && (
              <p className="text-xs text-slate-500">
                <span className="text-slate-500">{t("candResume")}: </span>
                <button
                  type="button"
                  onClick={openResumeViewer}
                  className="cursor-pointer text-left font-medium text-blue-600 underline decoration-blue-600/40 underline-offset-2 transition-smooth hover:text-blue-700 hover:decoration-blue-700 dark:text-sky-400 dark:decoration-sky-400/50 dark:hover:text-sky-300"
                >
                  {c.resumeFileName}
                </button>
              </p>
            )}
            {c.essay && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">
                  {t("candEssay")}
                </p>
                <p className="rounded-xl border border-brand-lime/20 bg-brand-lime/5 p-3 text-xs leading-relaxed text-slate-700 dark:border-brand-lime/15 dark:bg-brand-lime/10 dark:text-slate-300">
                  {c.essay}
                </p>
              </div>
            )}
          </section>

          <section className="mt-6 border-t border-brand-lime/15 pt-6 dark:border-brand-lime/10">
            <h3 className="font-semibold text-slate-800 dark:text-brand-lime/90">
              {t("candAiReport")}
            </h3>
            {!ev ? (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {t("candEvalPending")}
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <ScorePill
                    label={t("candScoreTotal")}
                    value={ev.totalScore}
                  />
                  <ScorePill
                    label={t("candLeadership")}
                    value={ev.leadershipScore}
                  />
                  <ScorePill
                    label={t("candProfessional")}
                    value={ev.professionalScore}
                  />
                  <ScorePill
                    label={t("candSocial")}
                    value={ev.socialScore}
                  />
                  <ScorePill
                    label={t("candPersonal")}
                    value={ev.personalScore}
                  />
                  <ScorePill
                    label={t("candAntiCheat")}
                    value={`${ev.antiCheatScore} %`}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    {t("candAnalysis")}
                  </p>
                  <p className="rounded-xl border border-brand-lime/20 bg-white/80 p-3 text-sm leading-relaxed text-slate-700 dark:border-brand-lime/15 dark:bg-slate-900/60 dark:text-slate-300">
                    {ev.analysis}
                  </p>
                </div>
              </div>
            )}
          </section>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={busy}
              onClick={() => void applyDecision("ACCEPTED")}
              className="flex-1 rounded-2xl bg-emerald-600 py-3 text-center text-sm font-bold text-white shadow-lg transition-smooth hover:bg-emerald-500 disabled:opacity-50"
            >
              {t("candAccept")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void applyDecision("REJECTED")}
              className="flex-1 rounded-2xl bg-red-600 py-3 text-center text-sm font-bold text-white shadow-lg transition-smooth hover:bg-red-500 disabled:opacity-50"
            >
              {t("candReject")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void applyDecision("RESERVE")}
              className="flex-1 rounded-2xl border-2 border-amber-400 bg-amber-100 py-3 text-center text-sm font-bold text-amber-950 shadow-md transition-smooth hover:bg-amber-200 disabled:opacity-50 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-900/60"
            >
              {t("candReserve")}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function ScorePill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-brand-lime/25 bg-brand-lime/10 px-3 py-2 text-center dark:border-brand-lime/20 dark:bg-brand-lime/10">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
        {typeof value === "number" ? String(value) : value}
      </p>
    </div>
  );
}
