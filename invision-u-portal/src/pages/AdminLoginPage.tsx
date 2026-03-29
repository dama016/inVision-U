import { FormEvent, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdminLoginPage() {
  const { isAdmin, adminReady, login } = useAdminAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/committee/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!adminReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-lime-soft dark:bg-slate-950">
        <p className="text-sm text-slate-600 dark:text-slate-400">…</p>
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/committee/dashboard" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        navigate(from === "/committee/login" ? "/committee/dashboard" : from, {
          replace: true,
        });
        return;
      }
      setError(t("committeeLoginError"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("committeeLoginError"));
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-brand-lime/35 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-smooth placeholder:text-slate-400 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/35 dark:border-brand-lime/25 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-lime dark:focus:ring-brand-lime/25";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-lime-soft via-white to-brand-lime-soft px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-brand-lime-ink/40">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-3 sm:right-6 sm:top-6">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-brand-lime/25 bg-white/90 p-8 shadow-lime backdrop-blur-md dark:border-brand-lime/20 dark:bg-slate-900/90">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lime text-xl font-bold text-slate-900 shadow-lime">
            AC
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("committeeLoginWelcome")}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("committeeLoginSubtitle")}
          </p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <label className="block text-sm font-medium text-slate-800 dark:text-brand-lime/90">
            {t("fieldEmail")}
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800 dark:text-brand-lime/90">
            {t("fieldPassword")}
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-brand-lime py-3.5 text-center text-base font-bold text-slate-900 shadow-lime transition-smooth hover:bg-brand-lime-hover focus:outline-none focus:ring-4 focus:ring-brand-lime/40 disabled:opacity-60 dark:focus:ring-brand-lime/35"
          >
            {t("btnLogin")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t("committeePortalTitle")}
        </p>
      </div>
    </div>
  );
}
