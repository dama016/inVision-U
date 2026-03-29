import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCandidates } from "@/api/backend";
import { CandidateDrawer } from "@/components/committee/CandidateDrawer";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CandidateDto } from "@/types/candidate";

type SortKey =
  | "name_asc"
  | "name_desc"
  | "date_desc"
  | "date_asc"
  | "total_desc"
  | "total_asc"
  | "leadership_desc"
  | "professional_desc"
  | "social_desc"
  | "personal_desc";

function sortCandidates(list: CandidateDto[], key: SortKey): CandidateDto[] {
  const copy = [...list];
  const num = (c: CandidateDto, fn: (e: NonNullable<CandidateDto["evaluation"]>) => number) =>
    c.evaluation != null ? fn(c.evaluation) : -1;

  copy.sort((a, b) => {
    switch (key) {
      case "name_asc":
        return a.fullName.localeCompare(b.fullName, "ru");
      case "name_desc":
        return b.fullName.localeCompare(a.fullName, "ru");
      case "date_desc":
        return (
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
      case "date_asc":
        return (
          new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
        );
      case "total_desc":
        return num(b, (e) => e.totalScore) - num(a, (e) => e.totalScore);
      case "total_asc": {
        const va = num(a, (e) => e.totalScore);
        const vb = num(b, (e) => e.totalScore);
        if (va < 0 && vb < 0) return 0;
        if (va < 0) return 1;
        if (vb < 0) return -1;
        return va - vb;
      }
      case "leadership_desc":
        return (
          num(b, (e) => e.leadershipScore) -
          num(a, (e) => e.leadershipScore)
        );
      case "professional_desc":
        return (
          num(b, (e) => e.professionalScore) -
          num(a, (e) => e.professionalScore)
        );
      case "social_desc":
        return num(b, (e) => e.socialScore) - num(a, (e) => e.socialScore);
      case "personal_desc":
        return (
          num(b, (e) => e.personalScore) - num(a, (e) => e.personalScore)
        );
      default:
        return 0;
    }
  });
  return copy;
}

export function CommitteeCandidatesPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<CandidateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [selected, setSelected] = useState<CandidateDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { candidates } = await fetchCandidates();
      setRows(candidates);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("candError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void load();
    }
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);
    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const base = pendingOnly
      ? rows.filter((c) => c.committeeDecision === "NONE")
      : rows;
    return sortCandidates(base, sortKey);
  }, [rows, pendingOnly, sortKey]);

  function openDrawer(c: CandidateDto) {
    setSelected(c);
    setDrawerOpen(true);
  }

  function onUpdated(c: CandidateDto) {
    setRows((prev) => prev.map((x) => (x.id === c.id ? c : x)));
  }

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "name_asc", label: t("sortNameAsc") },
    { value: "name_desc", label: t("sortNameDesc") },
    { value: "date_desc", label: t("sortDateDesc") },
    { value: "date_asc", label: t("sortDateAsc") },
    { value: "total_desc", label: t("sortTotalDesc") },
    { value: "total_asc", label: t("sortTotalAsc") },
    { value: "leadership_desc", label: t("sortLeadership") },
    { value: "professional_desc", label: t("sortProfessional") },
    { value: "social_desc", label: t("sortSocial") },
    { value: "personal_desc", label: t("sortPersonal") },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("committeeNavCandidates")}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {t("candSubtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-brand-lime/20 bg-white/80 p-4 shadow-md backdrop-blur-md dark:border-brand-lime/15 dark:bg-slate-900/60 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand-lime"
            checked={pendingOnly}
            onChange={(e) => setPendingOnly(e.target.checked)}
          />
          {t("candPendingOnly")}
        </label>

        <div className="flex flex-col gap-1 sm:min-w-[16rem]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("candSortLabel")}
          </span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-xl border border-brand-lime/35 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/35 dark:border-brand-lime/25 dark:bg-slate-950 dark:text-slate-100"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-brand-lime/40 px-4 py-2 text-sm font-semibold text-slate-800 transition-smooth hover:bg-brand-lime/15 dark:text-brand-lime dark:hover:bg-brand-lime/10"
        >
          {t("candRefresh")}
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-brand-lime/20 bg-white/90 shadow-lg backdrop-blur-md dark:border-brand-lime/15 dark:bg-slate-900/70">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            {t("candLoading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            {t("candEmpty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-lime/20 bg-brand-lime/10 dark:border-brand-lime/15 dark:bg-brand-lime/5">
                  <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {t("candColName")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {t("candColEmail")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {t("candColApplied")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {t("candColTotal")}
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {t("candColActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-brand-lime/10 transition-smooth hover:bg-brand-lime/5 dark:border-brand-lime/10 dark:hover:bg-brand-lime/10"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {c.fullName}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-slate-600 dark:text-slate-300">
                      {c.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(c.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-800 dark:text-slate-200">
                      {c.evaluation != null
                        ? String(c.evaluation.totalScore)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDrawer(c)}
                        className="rounded-lg bg-brand-lime px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition-smooth hover:bg-brand-lime-hover"
                      >
                        {t("candView")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CandidateDrawer
        candidate={selected}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        onUpdated={onUpdated}
      />
    </div>
  );
}
