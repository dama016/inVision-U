import type { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../db.js";
import { COOKIE_APPLICANT, COOKIE_COMMITTEE } from "./constants.js";
import {
  verifyApplicantToken,
  verifyCommitteeToken,
} from "./jwt.js";

export function noStore(_req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  next();
}

export function requireApplicant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  void (async () => {
    try {
      const raw = req.cookies?.[COOKIE_APPLICANT] as string | undefined;
      if (!raw) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const payload = verifyApplicantToken(raw);
      if (!payload || payload.role !== UserRole.APPLICANT) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.role !== UserRole.APPLICANT) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      (req as Request & { applicantUserId: string }).applicantUserId = user.id;
      next();
    } catch (e) {
      next(e);
    }
  })();
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  void (async () => {
    try {
      const raw = req.cookies?.[COOKIE_COMMITTEE] as string | undefined;
      if (!raw) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const payload = verifyCommitteeToken(raw);
      if (!payload || payload.role !== UserRole.ADMIN) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.role !== UserRole.ADMIN) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      (req as Request & { adminUserId: string }).adminUserId = user.id;
      next();
    } catch (e) {
      next(e);
    }
  })();
}
