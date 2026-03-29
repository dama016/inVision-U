export type CommitteeDecision =
  | "NONE"
  | "ACCEPTED"
  | "REJECTED"
  | "RESERVE";

export type ApplicationStatus = "PENDING";

export type EvaluationDto = {
  id: string;
  candidateId: string;
  totalScore: number;
  leadershipScore: number;
  professionalScore: number;
  socialScore: number;
  personalScore: number;
  analysis: string;
  antiCheatScore: number;
  createdAt: string;
  updatedAt: string;
};

export type CandidateDto = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  iin: string;
  applicationStatus: ApplicationStatus;
  essay: string | null;
  resumeFileName: string | null;
  appliedAt: string;
  committeeDecision: CommitteeDecision;
  createdAt: string;
  updatedAt: string;
  evaluation: EvaluationDto | null;
};

export type CandidatesListResponse = {
  candidates: CandidateDto[];
};
