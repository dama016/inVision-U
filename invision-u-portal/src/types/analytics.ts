export type AnalyticsSummary = {
  totalApplications: number;
  evaluatedCandidates: number;
  pendingCandidates: number;
};

export type SubmissionPoint = {
  label: string;
  count: number;
};

export type SubmissionsResponse = {
  granularity: "day" | "week" | "month";
  points: SubmissionPoint[];
};

export type ScoreBucket = {
  id: string;
  name: string;
  count: number;
};

export type ScoreBucketsResponse = {
  buckets: ScoreBucket[];
};

export type TopCandidateRow = {
  id: string;
  fullName: string;
  email: string;
  totalScore: number;
  appliedAt: string;
};

export type TopTodayResponse = {
  top: TopCandidateRow[];
};
