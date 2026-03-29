import bcrypt from "bcryptjs";
import type { Express, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../db.js";
import {
  COOKIE_APPLICANT,
  COOKIE_COMMITTEE,
} from "../auth/constants.js";
import {
  signApplicantToken,
  signCommitteeToken,
  verifyApplicantToken,
  verifyCommitteeToken,
} from "../auth/jwt.js";

const SALT_ROUNDS = 10;

function cookieBase() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function clearCookie(res: Response, name: string) {
  res.clearCookie(name, { path: "/" });
}

export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const raw = req.cookies?.[COOKIE_APPLICANT] as string | undefined;
    if (!raw) {
      res.json({ user: null, hasApplication: false });
      return;
    }
    const payload = verifyApplicantToken(raw);
    if (!payload) {
      clearCookie(res, COOKIE_APPLICANT);
      res.json({ user: null, hasApplication: false });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { candidate: { select: { id: true } } },
    });
    if (!user || user.role !== UserRole.APPLICANT) {
      clearCookie(res, COOKIE_APPLICANT);
      res.json({ user: null, hasApplication: false });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        iin: user.iin,
        role: user.role,
      },
      hasApplication: user.candidate !== null,
    });
  });

  app.get("/api/auth/admin/me", async (req: Request, res: Response) => {
    const raw = req.cookies?.[COOKIE_COMMITTEE] as string | undefined;
    if (!raw) {
      res.json({ admin: null });
      return;
    }
    const payload = verifyCommitteeToken(raw);
    if (!payload) {
      clearCookie(res, COOKIE_COMMITTEE);
      res.json({ admin: null });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.role !== UserRole.ADMIN) {
      clearCookie(res, COOKIE_COMMITTEE);
      res.json({ admin: null });
      return;
    }
    res.json({
      admin: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        email?: string;
        password?: string;
        fullName?: string;
        phone?: string;
        iin?: string;
      };
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? "";
      if (!email || !password || password.length < 6) {
        res.status(400).json({ error: "Invalid email or password" });
        return;
      }
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.APPLICANT,
          fullName: body.fullName?.trim() ?? "",
          phone: body.phone?.trim() ?? "",
          iin: body.iin?.trim() ?? "",
        },
      });
      const token = signApplicantToken(user.id, UserRole.APPLICANT);
      res.cookie(COOKIE_APPLICANT, token, cookieBase());
      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          iin: user.iin,
          role: user.role,
        },
        hasApplication: false,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const body = req.body as { email?: string; password?: string };
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? "";
      if (!email || !password) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      if (user.role !== UserRole.APPLICANT) {
        res.status(403).json({
          error: "Use the committee login for administrator accounts",
        });
        return;
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      const token = signApplicantToken(user.id, UserRole.APPLICANT);
      res.cookie(COOKIE_APPLICANT, token, cookieBase());
      const withCand = await prisma.user.findUnique({
        where: { id: user.id },
        include: { candidate: { select: { id: true } } },
      });
      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          iin: user.iin,
          role: user.role,
        },
        hasApplication: withCand?.candidate != null,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/admin/login", async (req: Request, res: Response) => {
    try {
      const body = req.body as { email?: string; password?: string };
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? "";
      if (!email || !password) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      if (user.role !== UserRole.ADMIN) {
        res.status(403).json({
          error: "Access denied: administrator role required",
        });
        return;
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      const token = signCommitteeToken(user.id, UserRole.ADMIN);
      res.cookie(COOKIE_COMMITTEE, token, cookieBase());
      res.json({
        admin: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const scope = (req.body as { scope?: string })?.scope;
    if (scope === "committee") {
      clearCookie(res, COOKIE_COMMITTEE);
    } else {
      clearCookie(res, COOKIE_APPLICANT);
    }
    res.json({ ok: true });
  });
}
