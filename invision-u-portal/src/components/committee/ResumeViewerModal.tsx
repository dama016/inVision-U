import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export type ResumeViewerKind = "pdf" | "image" | "unknown";

export function resumeViewerKindFromFileName(fileName: string): ResumeViewerKind {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "image";
  return "unknown";
}

type ResumeViewerModalProps = {
  open: boolean;
  onClose: () => void;
  resumeUrl: string;
  fileName: string;
};

export function ResumeViewerModal({
  open,
  onClose,
  resumeUrl,
  fileName,
}: ResumeViewerModalProps) {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const kind = resumeViewerKindFromFileName(fileName);

  useEffect(() => {
    if (!open) return;
    setImageError(false);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-viewer-title"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="relative z-[81] flex max-h-[92vh] w-full max-w-6xl flex-col rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <p
            id="resume-viewer-title"
            className="min-w-0 truncate text-sm font-semibold text-white"
            title={fileName}
          >
            {fileName}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-slate-300 transition-smooth hover:bg-white/10 hover:text-white"
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

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-4">
          {kind === "image" && !imageError && (
            <img
              src={resumeUrl}
              alt=""
              className="max-h-[min(85vh,900px)] w-full max-w-full object-contain"
              onError={() => setImageError(true)}
            />
          )}
          {kind === "image" && imageError && (
            <p className="text-center text-sm text-slate-300">
              {t("candResumeLoadError")}
            </p>
          )}
          {kind === "pdf" && (
            <iframe
              title={fileName}
              src={resumeUrl}
              className="h-[min(83vh,900px)] w-11/12 max-w-5xl rounded-lg border border-white/10 bg-white"
            />
          )}
          {kind === "unknown" && (
            <div className="max-w-md space-y-4 text-center text-sm text-slate-300">
              <p>{t("candResumeUnsupported")}</p>
              <a
                href={resumeUrl}
                download={fileName}
                className="inline-block rounded-xl bg-brand-lime px-4 py-2 text-sm font-bold text-slate-900 transition-smooth hover:bg-brand-lime-hover"
              >
                {t("candResumeDownload")}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
