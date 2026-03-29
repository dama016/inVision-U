import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

export function AuthScreen() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [iin, setIin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "register") {
        await register({
          fullName: fullName.trim(),
          phone: phone.trim(),
          iin: iin.trim(),
          email: email.trim(),
          password,
        });
        return;
      }
      await login(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("authErrorInvalid")
      );
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-brand-lime/35 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-smooth placeholder:text-slate-400 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/35 dark:border-brand-lime/25 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-lime dark:focus:ring-brand-lime/25";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-lime-soft via-white to-brand-lime-soft px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-brand-lime-ink/40">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-brand-lime/25 bg-white/90 p-8 shadow-lime backdrop-blur-md dark:border-brand-lime/20 dark:bg-slate-900/90">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lime text-xl font-bold text-slate-900 shadow-lime">
            iV
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("authWelcome")}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("authSubtitle")}
          </p>
        </div>

        <div className="mb-6 flex rounded-xl bg-brand-lime/20 p-1 dark:bg-brand-lime/10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-smooth ${
              mode === "login"
                ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-brand-lime"
                : "text-slate-600 hover:text-brand-lime-ink dark:text-brand-lime/60 dark:hover:text-brand-lime"
            }`}
          >
            {t("tabLogin")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-smooth ${
              mode === "register"
                ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-brand-lime"
                : "text-slate-600 hover:text-brand-lime-ink dark:text-brand-lime/60 dark:hover:text-brand-lime"
            }`}
          >
            {t("tabRegister")}
          </button>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          {mode === "register" && (
            <>
              <label className="block text-sm font-medium text-slate-800 dark:text-brand-lime/90">
                {t("fieldFullName")}
                <input
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800 dark:text-brand-lime/90">
                {t("fieldPhone")}
                <input
                  className={inputClass}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800 dark:text-brand-lime/90">
                {t("fieldIin")}
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={iin}
                  onChange={(e) => setIin(e.target.value)}
                  required
                />
              </label>
            </>
          )}
          <label className="block text-sm font-medium text-slate-800 dark:text-brand-lime/90">
            {t("fieldEmail")}
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              minLength={6}
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-lime py-3.5 text-center text-base font-bold text-slate-900 shadow-lime transition-smooth hover:bg-brand-lime-hover hover:shadow-lime-lg focus:outline-none focus:ring-4 focus:ring-brand-lime/40 dark:focus:ring-brand-lime/35"
          >
            {mode === "login" ? t("btnLogin") : t("btnRegister")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t("authFooter")}
        </p>
      </div>
    </div>
  );
}
