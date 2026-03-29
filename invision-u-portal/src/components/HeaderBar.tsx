import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export function HeaderBar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;

  return (
    <header className="border-b border-brand-lime/25 bg-white/90 backdrop-blur-md transition-smooth dark:border-brand-lime/15 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime text-lg font-bold text-slate-900 shadow-lime">
            iV
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-brand-lime">
              {t("brand")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("appTitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />

          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-lime bg-brand-lime/15 text-slate-900 shadow-md transition-smooth hover:border-brand-lime-hover hover:bg-brand-lime/25 hover:shadow-lime dark:border-brand-lime/55 dark:bg-brand-lime/10 dark:text-brand-lime dark:hover:border-brand-lime dark:hover:bg-brand-lime/15"
              aria-expanded={open}
              aria-haspopup="true"
              aria-label={t("profileMenu")}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {open && (
              <div
                className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-brand-lime/25 bg-white p-4 shadow-xl transition-smooth dark:border-brand-lime/20 dark:bg-slate-900"
                role="menu"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-brand-lime">
                  {user.fullName}
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">
                      {t("labelPhone")}
                    </dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">
                      {user.phone || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">
                      {t("labelEmail")}
                    </dt>
                    <dd className="break-all font-medium text-slate-800 dark:text-slate-200">
                      {user.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">
                      {t("labelIin")}
                    </dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">
                      {user.iin || "—"}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition-smooth hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950"
                >
                  {t("btnLogout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
