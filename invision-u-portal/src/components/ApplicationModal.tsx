import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { submitCandidateApplication } from "@/api/backend";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DictKey } from "@/i18n/dictionary";

type ApplicationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

const TOTAL_STEPS = 4;

type QuizRow = { q: DictKey; options: DictKey[] };

const QUIZ: QuizRow[] = [
  { q: "quizQ1", options: ["quizQ1o1", "quizQ1o2", "quizQ1o3"] },
  { q: "quizQ2", options: ["quizQ2o1", "quizQ2o2", "quizQ2o3"] },
  { q: "quizQ3", options: ["quizQ3o1", "quizQ3o2", "quizQ3o3"] },
  { q: "quizQ4", options: ["quizQ4o1", "quizQ4o2", "quizQ4o3"] },
];

const btnPrimaryEnabled =
  "enabled:bg-brand-lime enabled:text-slate-900 enabled:shadow-lime enabled:hover:bg-brand-lime-hover enabled:focus-visible:outline-none enabled:focus-visible:ring-4 enabled:focus-visible:ring-brand-lime/40 dark:enabled:shadow-lime dark:enabled:focus-visible:ring-brand-lime/35";

export function ApplicationModal({
  open,
  onClose,
  onSubmitted,
}: ApplicationModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [essay, setEssay] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep(1);
    setFile(null);
    setEssay("");
    setQuizAnswers({});
    setSubmitting(false);
    setSubmitError(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  if (!open) return null;

  const quizAnswered =
    QUIZ.length > 0 &&
    QUIZ.every((_, i) => quizAnswers[i] !== undefined);

  async function handleFinishQuiz() {
    if (!quizAnswered || submitting || !file) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitCandidateApplication({
        essay: essay.trim(),
        resumeFile: file,
      });
      onSubmitted?.();
      setStep(4);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : t("applicationSubmitError")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-brand-lime/25 bg-white shadow-2xl transition-smooth dark:border-brand-lime/20 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-lime/15 bg-white/95 px-6 py-4 backdrop-blur dark:border-brand-lime/15 dark:bg-slate-900/95">
          <p className="text-sm font-medium text-brand-lime-dim dark:text-brand-lime">
            {t("modalStep")} {step} {t("of")} {TOTAL_STEPS}
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 transition-smooth hover:bg-brand-lime-soft hover:text-brand-lime-ink dark:hover:bg-brand-lime/10 dark:hover:text-brand-lime"
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

        <div className="px-6 py-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2
                id="application-modal-title"
                className="text-center text-xl font-bold text-slate-900 dark:text-white"
              >
                {t("stepResumeTitle")}
              </h2>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                {t("stepResumeHint")}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ")
                    inputRef.current?.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-brand-lime/45 bg-brand-lime/10 px-6 py-14 text-center transition-smooth hover:border-brand-lime hover:bg-brand-lime/15 dark:border-brand-lime/35 dark:bg-brand-lime/10 dark:hover:border-brand-lime dark:hover:bg-brand-lime/15"
              >
                <p className="font-medium text-slate-800 dark:text-brand-lime/90">
                  {t("dropzone")}
                </p>
                {file && (
                  <p className="mt-3 text-sm text-brand-lime-dim dark:text-brand-lime">
                    {t("fileSelected")}: {file.name}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={!file}
                onClick={() => setStep(2)}
                className={`w-full rounded-2xl py-3.5 text-center text-base font-bold transition-smooth disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${btnPrimaryEnabled}`}
              >
                {t("btnNext")}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2
                id="application-modal-title"
                className="text-center text-xl font-bold text-slate-900 dark:text-white"
              >
                {t("stepEssayTitle")}
              </h2>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder={t("stepEssayPlaceholder")}
                rows={10}
                className="w-full resize-y rounded-2xl border border-brand-lime/30 bg-white px-4 py-3 text-slate-900 outline-none transition-smooth focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/35 dark:border-brand-lime/25 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-lime dark:focus:ring-brand-lime/25"
              />
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full rounded-2xl bg-brand-lime py-3.5 text-center text-base font-bold text-slate-900 shadow-lime transition-smooth hover:bg-brand-lime-hover focus:outline-none focus:ring-4 focus:ring-brand-lime/40 dark:focus:ring-brand-lime/35"
              >
                {t("btnNext")}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2
                  id="application-modal-title"
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  {t("stepQuizTitle")}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {t("stepQuizSubtitle")}
                </p>
              </div>
              <div className="space-y-6">
                {QUIZ.map((row, qi) => (
                  <fieldset
                    key={qi}
                    className="rounded-2xl border border-brand-lime/20 bg-brand-lime/5 p-4 dark:border-brand-lime/15 dark:bg-brand-lime/10"
                  >
                    <legend className="px-1 text-sm font-semibold text-slate-900 dark:text-brand-lime">
                      {t(row.q)}
                    </legend>
                    <div className="mt-3 space-y-2">
                      {row.options.map((opt, oi) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-smooth hover:bg-white/80 dark:hover:bg-slate-900/80"
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            checked={quizAnswers[qi] === oi}
                            onChange={() =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [qi]: oi,
                              }))
                            }
                            className="h-4 w-4 accent-brand-lime"
                          />
                          <span className="text-sm text-slate-800 dark:text-slate-200">
                            {t(opt)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              {submitError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  {submitError}
                </p>
              )}
              <button
                type="button"
                disabled={!quizAnswered || submitting}
                onClick={() => void handleFinishQuiz()}
                className={`w-full rounded-2xl py-3.5 text-center text-base font-bold transition-smooth disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${btnPrimaryEnabled}`}
              >
                {submitting ? t("applicationSubmitting") : t("btnNext")}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime/25 text-brand-lime-ink dark:bg-brand-lime/15 dark:text-brand-lime">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2
                id="application-modal-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                {t("stepSuccessTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t("stepSuccessBody")}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-2xl bg-brand-lime py-3.5 text-center text-base font-bold text-slate-900 shadow-lime transition-smooth hover:bg-brand-lime-hover focus:outline-none focus:ring-4 focus:ring-brand-lime/40 dark:focus:ring-brand-lime/35"
              >
                {t("btnClose")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
