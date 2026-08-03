export type Status =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export const STATUSES: Status[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export const STATUS_LABELS: Record<Status, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string; border: string }> = {
  applied: { bg: "bg-surfaceMuted", text: "text-inkSoft", dot: "bg-inkSoft", border: "border-border" },
  screening: { bg: "bg-brand2Soft", text: "text-[#0d8f81]", dot: "bg-brand2", border: "border-brand2/30" },
  interview: { bg: "bg-amberSoft", text: "text-[#8a611f]", dot: "bg-amber", border: "border-amber/30" },
  offer: { bg: "bg-brandSoft", text: "text-brand", dot: "bg-brand", border: "border-brand/30" },
  rejected: { bg: "bg-redSoft", text: "text-red", dot: "bg-red", border: "border-red/30" },
  withdrawn: { bg: "bg-surfaceMuted", text: "text-inkSoft", dot: "bg-inkSoft", border: "border-border" },
};

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: Status;
  applied_date: string; // ISO date
  follow_up_date: string | null;
  location: string | null;
  job_url: string | null;
  salary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationInput = Omit<
  Application,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  accent_color: string;
  created_at: string;
}

export interface OwnerInfo {
  display_name: string;
  accent_color: string;
  user_id: string;
}

export interface ApplicationWithOwner extends Application {
  owner: OwnerInfo;
}

export interface InterviewQuestion {
  id: string;
  user_id: string;
  category: string;
  prompt: string;
  focus: string | null;
  source: "manual" | "resume";
  created_at: string;
  updated_at: string;
}

export type InterviewQuestionInput = Pick<
  InterviewQuestion,
  "category" | "prompt" | "focus"
>;

export interface ResumeProfile {
  id: string;
  user_id: string;
  filename: string | null;
  resume_text: string;
  created_at: string;
  updated_at: string;
}
