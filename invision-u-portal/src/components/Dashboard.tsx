import { useState } from "react";
import { ApplicationModal } from "@/components/ApplicationModal";
import { HeaderBar } from "@/components/HeaderBar";
import { ThemeFAB } from "@/components/ThemeFAB";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function Dashboard() {
  const { t } = useLanguage();
  const { hasApplication, refreshMe } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const secondaryBtn =
    "rounded-2xl border-2 border-brand-lime/50 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition-smooth hover:border-brand-lime hover:bg-brand-lime-soft dark:border-brand-lime/35 dark:bg-slate-900 dark:text-brand-lime dark:hover:bg-brand-lime/10 dark:hover:border-brand-lime";

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lime-soft/90 to-white dark:from-slate-950 dark:to-slate-900">
      <HeaderBar />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t("welcomeTitle")}
        </h1>
        <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-400">
          {t("welcomeSubtitle")}
        </p>

        {hasApplication ? (
          <p className="mt-10 max-w-md rounded-2xl border border-brand-lime/30 bg-brand-lime/10 px-6 py-4 text-sm font-medium text-slate-800 dark:border-brand-lime/25 dark:bg-brand-lime/10 dark:text-brand-lime/90">
            {t("ctaAlreadyApplied")}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-10 w-full max-w-md rounded-2xl bg-gradient-to-r from-brand-lime via-brand-lime to-brand-lime-hover px-8 py-5 text-lg font-bold text-slate-900 shadow-lime-lg transition-smooth hover:scale-[1.02] hover:shadow-lime focus:outline-none focus:ring-4 focus:ring-brand-lime/40 dark:focus:ring-brand-lime/35 sm:text-xl"
          >
            {t("ctaApply")}
          </button>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            className={secondaryBtn}
            onClick={() => alert(t("toastFaq"))}
          >
            {t("btnFaq")}
          </button>
          <button
            type="button"
            className={secondaryBtn}
            onClick={() => alert(t("toastInstructions"))}
          >
            {t("btnInstructions")}
          </button>
        </div>
      </main>

      <ThemeFAB />
      <ApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={() => {
          void refreshMe();
        }}
      />
    </div>
  );
}
