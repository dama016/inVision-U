import type { Express, Request, Response } from "express";
import { prisma } from "../db.js";
import { noStore, requireAdmin } from "../auth/middleware.js";
import { ensureAllMissingEvaluations } from "../evaluation/ensureMockEvaluation.js";

type Granularity = "day" | "week" | "month";

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatKey(d: Date, g: Granularity): string {
  if (g === "day") return d.toISOString().slice(0, 10);
  if (g === "week") {
    const s = startOfWeek(d);
    return `W${s.toISOString().slice(0, 10)}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function parseGranularity(q: unknown): Granularity {
  if (q === "week" || q === "month") return q;
  return "day";
}

export function registerAnalyticsRoutes(app: Express) {
  app.get(
    "/api/analytics/summary",
    noStore,
    requireAdmin,
    async (_req: Request, res: Response) => {
      try {
        await ensureAllMissingEvaluations();
        const totalApplications = await prisma.candidate.count();
        const evaluated = await prisma.candidate.count({
          where: { evaluation: { isNot: null } },
        });
        const pending = totalApplications - evaluated;
        res.json({
          totalApplications,
          evaluatedCandidates: evaluated,
          pendingCandidates: pending,
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to load summary" });
      }
    }
  );

  app.get(
    "/api/analytics/submissions",
    noStore,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const granularity = parseGranularity(req.query.granularity);
        const candidates = await prisma.candidate.findMany({
          select: { appliedAt: true },
          orderBy: { appliedAt: "asc" },
        });

        const map = new Map<string, number>();
        for (const c of candidates) {
          const key = formatKey(new Date(c.appliedAt), granularity);
          map.set(key, (map.get(key) ?? 0) + 1);
        }

        const points = [...map.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([label, count]) => ({ label, count }));

        res.json({ granularity, points });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to load submissions" });
      }
    }
  );

  app.get(
    "/api/analytics/score-buckets",
    noStore,
    requireAdmin,
    async (_req: Request, res: Response) => {
      try {
        await ensureAllMissingEvaluations();
        const evals = await prisma.evaluation.findMany({
          select: { totalScore: true },
        });
        let range0_50 = 0;
        let range50_80 = 0;
        let range80_100 = 0;
        for (const e of evals) {
          if (e.totalScore < 50) range0_50++;
          else if (e.totalScore < 80) range50_80++;
          else range80_100++;
        }
        res.json({
          buckets: [
            { id: "0-50", name: "0 – 50", count: range0_50 },
            { id: "50-80", name: "50 – 80", count: range50_80 },
            { id: "80-100", name: "80 – 100", count: range80_100 },
          ],
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to load score buckets" });
      }
    }
  );

  app.get(
    "/api/analytics/top-today",
    noStore,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const limit = Math.min(
          10,
          Math.max(1, Number(req.query.limit) || 3)
        );
        await ensureAllMissingEvaluations();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const rows = await prisma.candidate.findMany({
          where: {
            appliedAt: { gte: start, lt: end },
            evaluation: { isNot: null },
          },
          include: {
            evaluation: true,
            user: { select: { fullName: true, email: true } },
          },
        });

        rows.sort(
          (a, b) =>
            (b.evaluation?.totalScore ?? 0) - (a.evaluation?.totalScore ?? 0)
        );

        const top = rows.slice(0, limit).map((c) => ({
          id: c.id,
          fullName: c.user.fullName,
          email: c.user.email,
          totalScore: c.evaluation!.totalScore,
          appliedAt: c.appliedAt.toISOString(),
        }));

        res.json({ top });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to load top candidates" });
      }
    }
  );
}
