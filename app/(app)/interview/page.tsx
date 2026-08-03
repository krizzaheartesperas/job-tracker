import InterviewMockQuestions from "@/components/InterviewMockQuestions";
import { getCurrentResume, getInterviewQuestions } from "@/lib/workspace";

export default async function InterviewPage() {
  const [customQuestions, savedResume] = await Promise.all([
    getInterviewQuestions(),
    getCurrentResume(),
  ]);

  return <InterviewMockQuestions customQuestions={customQuestions} savedResume={savedResume} />;
}
