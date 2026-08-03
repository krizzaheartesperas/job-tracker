"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationInput, InterviewQuestion, InterviewQuestionInput, Status } from "@/lib/types";

const SKILL_KEYWORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Supabase",
  "PostgreSQL",
  "SQL",
  "Python",
  "Java",
  "C#",
  "HTML",
  "CSS",
  "Tailwind",
  "API",
  "REST",
  "Git",
  "Figma",
  "Excel",
  "Customer service",
  "Sales",
  "Marketing",
  "Leadership",
  "Project management",
  "Communication",
  "Data analysis",
];

function detectResumeSkills(resumeText: string) {
  const normalized = resumeText.toLowerCase();
  return SKILL_KEYWORDS.filter((skill) => normalized.includes(skill.toLowerCase())).slice(0, 5);
}

function generateResumeQuestions(resumeText: string): InterviewQuestionInput[] {
  const skills = detectResumeSkills(resumeText);
  const primarySkill = skills[0] ?? "your strongest skill";
  const secondarySkill = skills[1] ?? "a tool or process from your resume";
  const thirdSkill = skills[2] ?? "one technical or workplace skill";

  return [
    {
      category: "Resume",
      prompt: "Walk me through your resume and explain the story behind your career path.",
      focus: "Connect your past roles, strongest experience, and the direction you want next.",
    },
    {
      category: "Resume",
      prompt: `Your resume mentions ${primarySkill}. Tell me about a time you used it to solve a real problem.`,
      focus: "Describe the problem, your exact contribution, and the result.",
    },
    {
      category: "Experience",
      prompt: "Which role or project on your resume best proves you can succeed in this position?",
      focus: "Pick one example and explain why it is directly relevant to the target job.",
    },
    {
      category: "Behavioral",
      prompt: "Tell me about a challenge from your resume experience that did not go as planned.",
      focus: "Show what happened, how you responded, and what you learned.",
    },
    {
      category: "Skills",
      prompt: `How would you explain your experience with ${secondarySkill} to someone non-technical?`,
      focus: "Use plain language and tie the skill to business or team impact.",
    },
    {
      category: "Impact",
      prompt: "What achievement from your resume are you most proud of, and how did you measure success?",
      focus: "Use numbers if you have them; otherwise explain the visible outcome.",
    },
    {
      category: "Growth",
      prompt: `What part of ${thirdSkill} are you still improving, and how are you working on it?`,
      focus: "Be honest while showing a concrete improvement habit.",
    },
    {
      category: "Closing",
      prompt: "Based on your resume, what should the interviewer remember about you?",
      focus: "Summarize your strongest match for the role in a concise closing answer.",
    },
  ];
}

export async function createApplication(input: ApplicationInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("applications")
    .insert({ ...input, user_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function updateApplication(id: string, input: Partial<ApplicationInput>) {
  const supabase = createClient();
  const { error } = await supabase.from("applications").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function updateApplicationStatus(id: string, status: Status) {
  return updateApplication(id, { status });
}

export async function deleteApplication(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function createInterviewQuestion(
  input: InterviewQuestionInput
): Promise<InterviewQuestion> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("interview_questions")
    .insert({ ...input, user_id: user.id })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/interview");
  return data as InterviewQuestion;
}

export async function saveResumeAndGenerateQuestions(input: {
  filename: string | null;
  resumeText: string;
}): Promise<InterviewQuestion[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const resumeText = input.resumeText.trim();
  if (resumeText.length < 80) {
    throw new Error("Resume text is too short to generate useful questions.");
  }

  const { error: resumeError } = await supabase.from("resumes").upsert(
    {
      user_id: user.id,
      filename: input.filename,
      resume_text: resumeText,
    },
    { onConflict: "user_id" }
  );

  if (resumeError) throw new Error(resumeError.message);

  const { error: deleteError } = await supabase
    .from("interview_questions")
    .delete()
    .eq("user_id", user.id)
    .eq("source", "resume");

  if (deleteError) throw new Error(deleteError.message);

  const generatedQuestions = generateResumeQuestions(resumeText).map((question) => ({
    ...question,
    user_id: user.id,
    source: "resume",
  }));

  const { data, error } = await supabase
    .from("interview_questions")
    .insert(generatedQuestions)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  revalidatePath("/interview");
  return (data ?? []) as InterviewQuestion[];
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
