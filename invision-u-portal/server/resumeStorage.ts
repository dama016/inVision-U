import { existsSync, mkdirSync } from "fs";
import path from "path";

export const RESUMES_DIR = path.join(process.cwd(), "uploads", "resumes");

export function ensureResumesDir(): void {
  mkdirSync(RESUMES_DIR, { recursive: true });
}

const ALLOWED_EXT = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

export function safeExtFromFilename(fileName: string): string {
  const e = path.extname(fileName).toLowerCase();
  return ALLOWED_EXT.has(e) ? e : ".pdf";
}

export function mimeForResumeExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return "application/octet-stream";
  }
}

export function resumeFileOnDisk(candidateId: string, resumeFileName: string): string {
  const ext = safeExtFromFilename(resumeFileName);
  return path.join(RESUMES_DIR, `${candidateId}${ext}`);
}

export function resumeFileExists(candidateId: string, resumeFileName: string): boolean {
  return existsSync(resumeFileOnDisk(candidateId, resumeFileName));
}
