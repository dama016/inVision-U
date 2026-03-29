import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeFAB } from "@/components/ThemeFAB";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function CommitteeLayout() {
  const { t } = useLanguage();
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-smooth ${
      isActive
        ? "bg-brand-lime text-slate-900 shadow-lime"
        : "text-slate-700 hover:bg-brand-lime/15 dark:text-slate-200 dark:hover:bg-brand-lime/10"
    }`;

  async function handleLogout() {
    await logout();
    navigate("/committee/login", { replace: true });
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-lime-soft/90 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-brand-lime/25 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-brand-lime/15 dark:bg-slate-900/85 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-brand-lime">
            {t("committeePortalTitle")}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            inVision U
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-smooth hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950 sm:px-4 sm:text-sm"
          >
            {t("committeeLogout")}
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-lime/40 bg-white/90 text-slate-900 shadow-sm transition-smooth hover:bg-brand-lime/20 dark:border-brand-lime/35 dark:bg-slate-800 dark:text-brand-lime dark:hover:bg-brand-lime/10"
            aria-expanded={sidebarOpen}
            aria-controls="committee-sidebar"
            aria-label={t("committeeMenuOpen")}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 dark:bg-black/50 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar panel (slides from right) */}
      <aside
        id="committee-sidebar"
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(20rem,100vw-2rem)] flex-col border-l border-brand-lime/25 bg-white/95 shadow-xl backdrop-blur-xl transition-transform duration-300 ease-out dark:border-brand-lime/20 dark:bg-slate-900/95 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-lime/20 px-4 py-4 dark:border-brand-lime/15">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("committeeNavSection")}
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition-smooth hover:bg-brand-lime/15 hover:text-slate-900 dark:hover:text-brand-lime"
            aria-label={t("committeeMenuClose")}
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

        <nav className="flex flex-1 flex-col gap-1 p-4" onClick={() => setSidebarOpen(false)}>
          <NavLink to="/committee/dashboard" className={linkClass} end={false}>
            <svg
              className="h-5 w-5 shrink-0 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            {t("committeeNavDashboard")}
          </NavLink>
          <NavLink to="/committee/candidates" className={linkClass}>
            <svg
              className="h-5 w-5 shrink-0 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {t("committeeNavCandidates")}
          </NavLink>
        </nav>

        <div className="border-t border-brand-lime/20 p-4 dark:border-brand-lime/15">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition-smooth hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950"
          >
            {t("committeeLogout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <ThemeFAB />
    </div>
  );
}
