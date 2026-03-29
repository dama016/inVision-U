import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchAnalyticsSummary,
  fetchScoreBuckets,
  fetchSubmissions,
  fetchTopToday,
} from "@/api/backend";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { ScoreBucket, SubmissionPoint } from "@/types/analytics";

type Granularity = "day" | "week" | "month";
type ChartKind = "line" | "bar";

const LIME = "#C5F231";
const LIME_DIM = "#9BB82A";

function MetricCard({
  label,
  value,
  dark,
}: {
  label: string;
  value: number;
  dark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-md backdrop-blur-md transition-smooth ${
        dark
          ? "border-brand-lime/20 bg-slate-900/70 shadow-black/20"
          : "border-brand-lime/25 bg-white/80 shadow-lime/30"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          dark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
  labels,
  dark,
}: {
  value: T;
  onChange: (v: T) => void;
  options: T[];
  labels: Record<T, string>;
  dark: boolean;
}) {
  return (
    <div
      className={`inline-flex rounded-xl border p-1 ${
        dark
          ? "border-brand-lime/25 bg-slate-900/50"
          : "border-brand-lime/30 bg-brand-lime/10"
      }`}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-smooth sm:text-sm ${
            value === opt
              ? "bg-brand-lime text-slate-900 shadow-sm"
              : dark
                ? "text-slate-300 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

export function CommitteeDashboardPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [summary, setSummary] = useState<{
    totalApplications: number;
    evaluatedCandidates: number;
    pendingCandidates: number;
  } | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [chartKind, setChartKind] = useState<ChartKind>("bar");
  const [points, setPoints] = useState<SubmissionPoint[]>([]);
  const [buckets, setBuckets] = useState<ScoreBucket[]>([]);
  const [topToday, setTopToday] = useState<
    { id: string; fullName: string; totalScore: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [s, sub, buck, top] = await Promise.all([
        fetchAnalyticsSummary(),
        fetchSubmissions(granularity),
        fetchScoreBuckets(),
        fetchTopToday(3),
      ]);
      setSummary(s);
      setPoints(sub.points);
      setBuckets(buck.buckets);
      setTopToday(top.top);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("dashLoadError"));
    } finally {
      setLoading(false);
    }
  }, [granularity, t]);

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

  const axisColor = dark ? "#94a3b8" : "#64748b";
  const gridColor = dark ? "#334155" : "#e2e8f0";
  const tooltipBg = dark ? "#0f172a" : "#ffffff";
  const tooltipBorder = dark ? "#334155" : "#e2e8f0";

  const pieColors = useMemo(
    () => [LIME_DIM, LIME, dark ? "#475569" : "#cbd5e1"],
    [dark]
  );

  const chartData = useMemo(
    () => points.map((p) => ({ ...p, name: p.label })),
    [points]
  );

  const chartToggleLabels = useMemo(
    () =>
      ({
        line: t("dashChartLine"),
        bar: t("dashChartBar"),
      }) as Record<ChartKind, string>,
    [t]
  );

  const granLabels = useMemo(
    () =>
      ({
        day: t("dashByDay"),
        week: t("dashByWeek"),
        month: t("dashByMonth"),
      }) as Record<Granularity, string>,
    [t]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("committeeNavDashboard")}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {t("dashSubtitle")}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-3 font-semibold underline"
          >
            {t("dashRetry")}
          </button>
        </div>
      )}

      {loading && !summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80"
            />
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label={t("dashTotalApplications")}
            value={summary.totalApplications}
            dark={dark}
          />
          <MetricCard
            label={t("dashEvaluated")}
            value={summary.evaluatedCandidates}
            dark={dark}
          />
          <MetricCard
            label={t("dashPending")}
            value={summary.pendingCandidates}
            dark={dark}
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div
          className={`rounded-3xl border p-6 shadow-lg backdrop-blur-md lg:col-span-2 ${
            dark
              ? "border-brand-lime/15 bg-slate-900/60"
              : "border-brand-lime/20 bg-white/75"
          }`}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("dashSubmissionsTitle")}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                value={chartKind}
                onChange={setChartKind}
                options={["bar", "line"] as const}
                labels={chartToggleLabels}
                dark={dark}
              />
              <ToggleGroup
                value={granularity}
                onChange={setGranularity}
                options={["day", "week", "month"] as const}
                labels={granLabels}
                dark={dark}
              />
            </div>
          </div>

          <div className="h-[300px] w-full min-w-0">
            {chartData.length === 0 ? (
              <p className="py-16 text-center text-slate-500 dark:text-slate-400">
                {t("dashNoData")}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartKind === "bar" ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: axisColor, fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: 12,
                      }}
                      labelStyle={{ color: axisColor }}
                    />
                    <Bar
                      dataKey="count"
                      fill={LIME}
                      radius={[8, 8, 0, 0]}
                      isAnimationActive
                      animationDuration={700}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                ) : (
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: axisColor, fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: axisColor, fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={LIME}
                      strokeWidth={3}
                      dot={{ fill: LIME, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 7 }}
                      isAnimationActive
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div
          className={`rounded-3xl border p-6 shadow-lg backdrop-blur-md ${
            dark
              ? "border-brand-lime/15 bg-slate-900/60"
              : "border-brand-lime/20 bg-white/75"
          }`}
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t("dashScoreDistribution")}
          </h2>
          <div className="mx-auto h-[220px] w-full max-w-[240px]">
            {buckets.every((b) => b.count === 0) ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("dashNoScores")}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buckets as { name: string; count: number }[]}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {buckets.map((b, i) => (
                      <Cell
                        key={b.id}
                        fill={pieColors[i % pieColors.length]}
                        stroke={dark ? "#0f172a" : "#fff"}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {buckets.map((b, i) => (
              <li
                key={b.id}
                className="flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: pieColors[i % pieColors.length],
                    }}
                  />
                  {b.name}
                </span>
                <span className="font-semibold tabular-nums">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={`rounded-3xl border p-6 shadow-lg backdrop-blur-md ${
          dark
            ? "border-brand-lime/15 bg-slate-900/60"
            : "border-brand-lime/20 bg-white/75"
        }`}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("dashTop3Title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("dashTop3Hint")}
        </p>
        <ol className="mt-4 space-y-3">
          {topToday.length === 0 ? (
            <li className="text-slate-500 dark:text-slate-400">
              {t("dashTop3Empty")}
            </li>
          ) : (
            topToday.map((c, idx) => (
              <li
                key={c.id}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                  dark
                    ? "border-brand-lime/15 bg-slate-950/40"
                    : "border-brand-lime/20 bg-brand-lime/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-lime text-sm font-bold text-slate-900">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {c.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("dashScoreLabel")}: {c.totalScore}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ol>
      </div>
    </div>
  );
}
