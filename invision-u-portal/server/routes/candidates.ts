import type { Express, Request, Response } from "express";
import { ApplicationStatus, CommitteeDecision } from "@prisma/client";
import { promises as fs } from "fs";
import multer from "multer";
import path from "path";
import { prisma } from "../db.js";
import { requireAdmin, requireApplicant } from "../auth/middleware.js";
import {
  ensureMockEvaluation,
  ensureMockEvaluations,
} from "../evaluation/ensureMockEvaluation.js";
import {
  ensureResumesDir,
  mimeForResumeExt,
  resumeFileExists,
  resumeFileOnDisk,
  safeExtFromFilename,
} from "../resumeStorage.js";

const DECISIONS = new Set<string>(Object.values(CommitteeDecision));

type CandRow = {
  id: string;
  userId: string;
  applicationStatus: ApplicationStatus;
  essay: string | null;
  resumeFileName: string | null;
  appliedAt: Date;
  committeeDecision: CommitteeDecision;
  createdAt: Date;
  updatedAt: Date;
  user: {
    email: string;
    fullName: string;
    phone: string;
    iin: string;
  };
  evaluation: {
    id: string;
    candidateId: string;
    totalScore: number;
    leadershipScore: number;
    professionalScore: number;
    socialScore: number;
    personalScore: number;
    analysis: string;
    antiCheatScore: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

function mapCandidate(c: CandRow) {
  return {
    id: c.id,
    userId: c.userId,
    fullName: c.user.fullName,
    email: c.user.email,
    phone: c.user.phone,
    iin: c.user.iin,
    applicationStatus: c.applicationStatus,
    essay: c.essay,
    resumeFileName: c.resumeFileName,
    appliedAt: c.appliedAt.toISOString(),
    committeeDecision: c.committeeDecision,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    evaluation: c.evaluation
      ? {
          id: c.evaluation.id,
          candidateId: c.evaluation.candidateId,
          totalScore: c.evaluation.totalScore,
          leadershipScore: c.evaluation.leadershipScore,
          professionalScore: c.evaluation.professionalScore,
          socialScore: c.evaluation.socialScore,
          personalScore: c.evaluation.personalScore,
          analysis: c.evaluation.analysis,
          antiCheatScore: c.evaluation.antiCheatScore,
          createdAt: c.evaluation.createdAt.toISOString(),
          updatedAt: c.evaluation.updatedAt.toISOString(),
        }
      : null,
  };
}

export function registerCandidateRoutes(app: Express) {
  ensureResumesDir();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  app.post(
    "/api/candidates",
    requireApplicant,
    upload.single("resume"),
    async (req: Request, res: Response) => {
      try {
        const uid = (req as Request & { applicantUserId: string })
          .applicantUserId;
        const body = req.body as {
          essay?: string;
          resumeFileName?: string;
        };
        const essay =
          typeof body.essay === "string" ? body.essay.trim() : "";
        const file = req.file;
        const resumeFileName =
          file?.originalname?.trim() ??
          (typeof body.resumeFileName === "string" &&
          body.resumeFileName.trim()
            ? body.resumeFileName.trim()
            : null);

        const existing = await prisma.candidate.findUnique({
          where: { userId: uid },
        });
        if (existing) {
          res.status(409).json({ error: "Application already submitted" });
          return;
        }
        const created = await prisma.candidate.create({
          data: {
            userId: uid,
            applicationStatus: ApplicationStatus.PENDING,
            essay: essay || null,
            resumeFileName,
          },
          include: {
            user: {
              select: { email: true, fullName: true, phone: true, iin: true },
            },
            evaluation: true,
          },
        });

        if (file?.buffer && resumeFileName) {
          const fp = resumeFileOnDisk(created.id, resumeFileName);
          await fs.writeFile(fp, file.buffer);
        }

        const withEval = await ensureMockEvaluation(created);
        res.status(201).json(mapCandidate(withEval as CandRow));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create application" });
      }
    }
  );

  app.get(
    "/api/candidates",
    requireAdmin,
    async (_req: Request, res: Response) => {
      try {
        const list = await prisma.candidate.findMany({
          include: {
            user: {
              select: { email: true, fullName: true, phone: true, iin: true },
            },
            evaluation: true,
          },
          orderBy: { appliedAt: "desc" },
        });
        const withEvaluations = await ensureMockEvaluations(list);
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.json({
          candidates: withEvaluations.map((c) => mapCandidate(c as CandRow)),
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to list candidates" });
      }
    }
  );

  app.get(
    "/api/candidates/:id/resume",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const c = await prisma.candidate.findUnique({
          where: { id: req.params.id },
        });
        if (!c?.resumeFileName) {
          res.status(404).json({ error: "No resume on file" });
          return;
        }
        if (!resumeFileExists(req.params.id, c.resumeFileName)) {
          res.status(404).json({ error: "Resume file not on server" });
          return;
        }
        const fp = resumeFileOnDisk(req.params.id, c.resumeFileName);
        const ext = safeExtFromFilename(c.resumeFileName);
        res.setHeader("Content-Type", mimeForResumeExt(ext));
        res.setHeader("Cache-Control", "private, no-store");
        res.sendFile(path.resolve(fp));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to load resume" });
      }
    }
  );

  app.get(
    "/api/candidates/:id",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const c = await prisma.candidate.findUnique({
          where: { id: req.params.id },
          include: {
            user: {
              select: { email: true, fullName: true, phone: true, iin: true },
            },
            evaluation: true,
          },
        });
        if (!c) {
          res.status(404).json({ error: "Not found" });
          return;
        }
        const withEval = await ensureMockEvaluation(c);
        res.setHeader("Cache-Control", "no-store");
        res.json(mapCandidate(withEval as CandRow));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to load candidate" });
      }
    }
  );

  app.patch(
    "/api/candidates/:id",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const { committeeDecision } = req.body as {
          committeeDecision?: string;
        };
        if (
          committeeDecision === undefined ||
          typeof committeeDecision !== "string" ||
          !DECISIONS.has(committeeDecision)
        ) {
          res.status(400).json({
            error:
              "Invalid body: committeeDecision must be one of NONE | ACCEPTED | REJECTED | RESERVE",
          });
          return;
        }

        const updated = await prisma.candidate.update({
          where: { id: req.params.id },
          data: {
            committeeDecision: committeeDecision as CommitteeDecision,
          },
          include: {
            user: {
              select: { email: true, fullName: true, phone: true, iin: true },
            },
            evaluation: true,
          },
        });
        const withEval = await ensureMockEvaluation(updated);
        res.setHeader("Cache-Control", "no-store");
        res.json(mapCandidate(withEval as CandRow));
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update candidate" });
      }
    }
  );
}
