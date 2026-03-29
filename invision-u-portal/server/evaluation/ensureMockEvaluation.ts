import type { ApplicationStatus, CommitteeDecision } from "@prisma/client";
import { prisma } from "../db.js";

const CRITICAL_SPAM_ANALYSIS =
  "КРИТИЧЕСКОЕ НЕСООТВЕТСТВИЕ: Объем эссе меньше минимально допустимого. Смысловая нагрузка отсутствует. Автоматический отказ.";

const MASH_ANALYSIS =
  "КРИТИЧЕСКОЕ НЕСООТВЕТСТВИЕ: Обнаружена низкая текстовая валидность (подозрение на случайный набор символов или спам). Автоматический отказ.";

const MID_LENGTH_ANALYSIS =
  "Объём эссе ниже рекомендуемого порога; детализация и раскрытие компетенций ограничены.";

const ANALYSIS_VARIANTS = [
  "Сильные лидерские намерения прослеживаются в структуре ответа; рекомендуется углубить примеры из опыта.",
  "Профессиональная мотивация выражена ясно; для усиления впечатления стоит добавить измеримые результаты.",
  "Социальная вовлечённость и командный контекст описаны убедительно.",
  "Личные качества и рефлексия переданы последовательно; хороший потенциал для программы.",
  "Баланс между амбициями и реалистичностью планов соблюдён; развитие коммуникации усилит позицию.",
  "Конкретика по ролям и задачам могла бы быть шире, однако общий уровень подготовки высокий.",
  "Видна системность мышления и готовность к ответственности.",
  "Мотивация соответствует ценностям программы; рекомендуется дополнить кейсами взаимодействия с сообществом.",
] as const;

/** +10 to category when keyword appears (case-insensitive). */
const KEYWORD_RULES: { pattern: RegExp; category: "leadership" | "professional" | "social" | "personal" }[] =
  [
    { pattern: /проект/i, category: "professional" },
    { pattern: /команда/i, category: "social" },
    { pattern: /опыт/i, category: "professional" },
    { pattern: /лидер/i, category: "leadership" },
    { pattern: /цель/i, category: "personal" },
    { pattern: /software/i, category: "professional" },
    { pattern: /team/i, category: "social" },
  ];

export type CandidateWithUserEval = {
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

function countWords(essay: string | null): number {
  if (!essay?.trim()) return 0;
  return essay.trim().split(/\s+/).filter(Boolean).length;
}

function looksLikeKeyboardMash(text: string): boolean {
  const t = text.trim();
  if (t.length === 0) return true;
  const letters = (t.match(/[a-zA-Zа-яА-ЯёЁ]/g) ?? []).length;
  if (letters === 0) return true;
  if (letters / t.length < 0.28) return true;
  if (/(.)\1{8,}/.test(t)) return true;
  const nonAlnum = (t.match(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g) ?? []).length;
  if (nonAlnum / t.length > 0.45) return true;
  return false;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function pickVariantFromEssay(essay: string): string {
  let sum = 0;
  for (let i = 0; i < essay.length; i++) sum += essay.charCodeAt(i);
  return ANALYSIS_VARIANTS[sum % ANALYSIS_VARIANTS.length] ?? ANALYSIS_VARIANTS[0];
}

function applyKeywordBonuses(
  essay: string,
  baseLeadership: number,
  baseProfessional: number,
  baseSocial: number,
  basePersonal: number,
  bonus: number
): {
  leadershipScore: number;
  professionalScore: number;
  socialScore: number;
  personalScore: number;
} {
  let leadershipScore = baseLeadership;
  let professionalScore = baseProfessional;
  let socialScore = baseSocial;
  let personalScore = basePersonal;

  for (const { pattern, category } of KEYWORD_RULES) {
    if (!pattern.test(essay)) continue;
    switch (category) {
      case "leadership":
        leadershipScore += bonus;
        break;
      case "professional":
        professionalScore += bonus;
        break;
      case "social":
        socialScore += bonus;
        break;
      case "personal":
        personalScore += bonus;
        break;
      default:
        break;
    }
  }

  return {
    leadershipScore: clamp(leadershipScore, 0, 100),
    professionalScore: clamp(professionalScore, 0, 100),
    socialScore: clamp(socialScore, 0, 100),
    personalScore: clamp(personalScore, 0, 100),
  };
}

function averageTotal(
  l: number,
  p: number,
  s: number,
  per: number
): number {
  return Math.round((l + p + s + per) / 4);
}

/**
 * Strict mock AI: word count, keyword bonuses, mash / spam detection.
 * Same essay → same scores (deterministic).
 */
export function buildScoresAndAnalysis(args: { essay: string | null }): {
  leadershipScore: number;
  professionalScore: number;
  socialScore: number;
  personalScore: number;
  totalScore: number;
  analysis: string;
  antiCheatScore: number;
} {
  const essay = args.essay?.trim() ?? "";
  const words = countWords(args.essay);
  const mash = looksLikeKeyboardMash(essay);

  /** Under 15 words: leadership/professional/social = 0, personal = 5, total under 10 */
  if (words < 15 || (mash && words < 40)) {
    const leadershipScore = 0;
    const professionalScore = 0;
    const socialScore = 0;
    const personalScore = 5;
    const totalScore = averageTotal(
      leadershipScore,
      professionalScore,
      socialScore,
      personalScore
    );
    return {
      leadershipScore,
      professionalScore,
      socialScore,
      personalScore,
      totalScore,
      analysis: words < 15 ? CRITICAL_SPAM_ANALYSIS : MASH_ANALYSIS,
      antiCheatScore: 10,
    };
  }

  /** Long text but looks like mash */
  if (mash) {
    const leadershipScore = 0;
    const professionalScore = 0;
    const socialScore = 0;
    const personalScore = 5;
    return {
      leadershipScore,
      professionalScore,
      socialScore,
      personalScore,
      totalScore: averageTotal(
        leadershipScore,
        professionalScore,
        socialScore,
        personalScore
      ),
      analysis: MASH_ANALYSIS,
      antiCheatScore: 10,
    };
  }

  /** 15–40 words: stricter mid band, smaller bonuses */
  if (words < 40) {
    const base = 30;
    const { leadershipScore, professionalScore, socialScore, personalScore } =
      applyKeywordBonuses(essay, base, base, base, base, 5);
    const totalScore = averageTotal(
      leadershipScore,
      professionalScore,
      socialScore,
      personalScore
    );
    const antiCheatScore = clamp(38 + (words % 18), 35, 60);
    return {
      leadershipScore,
      professionalScore,
      socialScore,
      personalScore,
      totalScore,
      analysis: `${MID_LENGTH_ANALYSIS} ${pickVariantFromEssay(essay)}`,
      antiCheatScore,
    };
  }

  /** >40 words: base 40 per dimension, +10 per matched keyword in that category */
  const base = 40;
  const { leadershipScore, professionalScore, socialScore, personalScore } =
    applyKeywordBonuses(essay, base, base, base, base, 10);
  const totalScore = averageTotal(
    leadershipScore,
    professionalScore,
    socialScore,
    personalScore
  );
  const antiCheatScore = clamp(12 + (essay.length % 24), 10, 36);

  return {
    leadershipScore,
    professionalScore,
    socialScore,
    personalScore,
    totalScore,
    analysis: pickVariantFromEssay(essay),
    antiCheatScore,
  };
}

export async function ensureMockEvaluation(
  row: CandidateWithUserEval
): Promise<CandidateWithUserEval> {
  const payload = buildScoresAndAnalysis({
    essay: row.essay,
  });

  const evaluation = await prisma.evaluation.upsert({
    where: { candidateId: row.id },
    create: {
      candidateId: row.id,
      leadershipScore: payload.leadershipScore,
      professionalScore: payload.professionalScore,
      socialScore: payload.socialScore,
      personalScore: payload.personalScore,
      totalScore: payload.totalScore,
      analysis: payload.analysis,
      antiCheatScore: payload.antiCheatScore,
    },
    update: {
      leadershipScore: payload.leadershipScore,
      professionalScore: payload.professionalScore,
      socialScore: payload.socialScore,
      personalScore: payload.personalScore,
      totalScore: payload.totalScore,
      analysis: payload.analysis,
      antiCheatScore: payload.antiCheatScore,
    },
  });

  return { ...row, evaluation };
}

export async function ensureMockEvaluations(
  rows: CandidateWithUserEval[]
): Promise<CandidateWithUserEval[]> {
  return Promise.all(rows.map((r) => ensureMockEvaluation(r)));
}

/** Syncs heuristic evaluations for all candidates (analytics / consistency). */
export async function ensureAllMissingEvaluations(): Promise<void> {
  const all = await prisma.candidate.findMany({
    include: {
      user: {
        select: { email: true, fullName: true, phone: true, iin: true },
      },
      evaluation: true,
    },
  });
  if (all.length === 0) return;
  await ensureMockEvaluations(all as CandidateWithUserEval[]);
}
