import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/i18n/dictionary";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  const pill = (code: Locale, label: string) => (
    <button
      type="button"
      onClick={() => setLocale(code)}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-smooth ${
        locale === code
          ? "bg-brand-lime text-slate-900 shadow dark:bg-brand-lime dark:text-slate-900"
          : "text-slate-600 hover:text-brand-lime-ink dark:text-brand-lime/65 dark:hover:text-brand-lime"
      }`}
      aria-pressed={locale === code}
    >
      {label}
    </button>
  );

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-brand-lime/35 bg-brand-lime/15 p-1 dark:border-brand-lime/25 dark:bg-brand-lime/10"
      role="group"
      aria-label="Language"
    >
      {pill("ru", t("langRu"))}
      {pill("kz", t("langKz"))}
    </div>
  );
}
