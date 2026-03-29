import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import {
  COOKIE_APPLICANT,
  COOKIE_COMMITTEE,
  JWT_KIND_APPLICANT,
  JWT_KIND_COMMITTEE,
} from "./constants.js";

const SECRET = process.env.JWT_SECRET ?? "dev-only-change-in-production";
const TTL = "7d";

export type JwtPayload = {
  sub: string;
  role: UserRole;
  kind: typeof JWT_KIND_APPLICANT | typeof JWT_KIND_COMMITTEE;
};

export function signApplicantToken(userId: string, role: UserRole): string {
  const payload: JwtPayload = {
    sub: userId,
    role,
    kind: JWT_KIND_APPLICANT,
  };
  return jwt.sign(payload, SECRET, { expiresIn: TTL });
}

export function signCommitteeToken(userId: string, role: UserRole): string {
  const payload: JwtPayload = {
    sub: userId,
    role,
    kind: JWT_KIND_COMMITTEE,
  };
  return jwt.sign(payload, SECRET, { expiresIn: TTL });
}

export function verifyApplicantToken(token: string): JwtPayload | null {
  try {
    const p = jwt.verify(token, SECRET) as JwtPayload;
    if (p.kind !== JWT_KIND_APPLICANT) return null;
    return p;
  } catch {
    return null;
  }
}

export function verifyCommitteeToken(token: string): JwtPayload | null {
  try {
    const p = jwt.verify(token, SECRET) as JwtPayload;
    if (p.kind !== JWT_KIND_COMMITTEE) return null;
    return p;
  } catch {
    return null;
  }
}

export function cookieNameForApplicant() {
  return COOKIE_APPLICANT;
}

export function cookieNameForCommittee() {
  return COOKIE_COMMITTEE;
}
