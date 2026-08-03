"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { createInterviewQuestion, saveResumeAndGenerateQuestions } from "@/lib/actions";
import type { InterviewQuestion, ResumeProfile } from "@/lib/types";

const ANSWER_SECONDS = 180;

type MockQuestion = {
  category: string;
  prompt: string;
  focus: string;
  source: "manual" | "resume";
};

type DeckMode = "manual" | "resume";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString();
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function InterviewMockQuestions({
  customQuestions,
  savedResume,
}: {
  customQuestions: InterviewQuestion[];
  savedResume: ResumeProfile | null;
}) {
  const [manualQuestions, setManualQuestions] = useState<MockQuestion[]>(
    customQuestions.filter((question) => question.source !== "resume").map((question) => ({
      category: question.category,
      prompt: question.prompt,
      focus: question.focus ?? "Answer with a clear example, your action, and the result.",
      source: "manual",
    }))
  );
  const [resumeQuestions, setResumeQuestions] = useState<MockQuestion[]>(
    customQuestions.filter((question) => question.source === "resume").map((question) => ({
      category: question.category,
      prompt: question.prompt,
      focus: question.focus ?? "Answer with a clear example, your action, and the result.",
      source: "resume",
    }))
  );
  const [deckMode, setDeckMode] = useState<DeckMode>("manual");
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ANSWER_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState<Record<DeckMode, number[]>>({
    manual: [],
    resume: [],
  });
  const [newCategory, setNewCategory] = useState("Custom");
  const [newPrompt, setNewPrompt] = useState("");
  const [newFocus, setNewFocus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [resumeText, setResumeText] = useState(savedResume?.resume_text ?? "");
  const [resumeFilename, setResumeFilename] = useState(savedResume?.filename ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [isDraggingResume, setIsDraggingResume] = useState(false);

  const questions = deckMode === "manual" ? manualQuestions : resumeQuestions;
  const completedForDeck = completed[deckMode];
  const activeQuestion = questions[activeIndex];
  const progress = useMemo(
    () => ((ANSWER_SECONDS - secondsLeft) / ANSWER_SECONDS) * 100,
    [secondsLeft]
  );
  const isTimeUp = secondsLeft === 0;

  useEffect(() => {
    if (!isRunning || secondsLeft === 0) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setIsRunning(false);
  }, [secondsLeft]);

  function switchDeck(nextMode: DeckMode) {
    setDeckMode(nextMode);
    setActiveIndex(0);
    setSecondsLeft(ANSWER_SECONDS);
    setIsRunning(false);
  }

  function selectQuestion(index: number) {
    if (!questions[index]) return;
    setActiveIndex(index);
    setSecondsLeft(ANSWER_SECONDS);
    setIsRunning(false);
  }

  function markDone() {
    if (!activeQuestion) return;
    setCompleted((current) => ({
      ...current,
      [deckMode]: current[deckMode].includes(activeIndex)
        ? current[deckMode]
        : [...current[deckMode], activeIndex],
    }));
  }

  function nextQuestion() {
    if (questions.length === 0) return;
    markDone();
    selectQuestion((activeIndex + 1) % questions.length);
  }

  async function addQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = newPrompt.trim();
    if (!prompt) return;

    const input = {
      category: newCategory.trim() || "Custom",
      prompt,
      focus: newFocus.trim() || "Answer with a clear example, your action, and the result.",
    };

    setIsSaving(true);
    setSaveError("");

    try {
      const savedQuestion = await createInterviewQuestion(input);
      const question: MockQuestion = {
        category: savedQuestion.category,
        prompt: savedQuestion.prompt,
        focus: savedQuestion.focus ?? input.focus,
        source: "manual",
      };

      setManualQuestions((current) => {
        const nextQuestions = [...current, question];
        setDeckMode("manual");
        setActiveIndex(nextQuestions.length - 1);
        return nextQuestions;
      });
      setNewCategory("Custom");
      setNewPrompt("");
      setNewFocus("");
      setSecondsLeft(ANSWER_SECONDS);
      setIsRunning(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save question.");
    } finally {
      setIsSaving(false);
    }
  }

  async function readResumeFile(file: File) {
    if (!file) return;

    setResumeError("");
    setResumeFilename(file.name);

    if (!/\.(txt|md|csv)$/i.test(file.name)) {
      setResumeText("");
      setResumeError("Upload a plain text resume file: TXT, MD, or CSV.");
      return;
    }

    const text = await file.text();
    setResumeText(text);
  }

  async function handleResumeFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) await readResumeFile(file);
  }

  async function handleResumeDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingResume(false);

    const file = event.dataTransfer.files?.[0];
    if (file) await readResumeFile(file);
  }

  async function generateFromResume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsGenerating(true);
    setResumeError("");

    try {
      const generated = await saveResumeAndGenerateQuestions({
        filename: resumeFilename || null,
        resumeText,
      });

      setResumeQuestions(
        generated.map((question) => ({
          category: question.category,
          prompt: question.prompt,
          focus: question.focus ?? "Answer with a clear example, your action, and the result.",
          source: "resume",
        }))
      );
      setCompleted((current) => ({ ...current, resume: [] }));
      switchDeck("resume");
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : "Could not generate questions.");
    } finally {
      setIsGenerating(false);
    }
  }

  function resetTimer() {
    setSecondsLeft(ANSWER_SECONDS);
    setIsRunning(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkSoft">
            Interview practice
          </p>
          <h1 className="font-display font-semibold text-2xl md:text-3xl tracking-tight mt-1">
            Mock interview flashcards
          </h1>
          <p className="text-sm text-inkSoft mt-2 max-w-2xl">
            Practice one question at a time with a 3-minute answer window.
          </p>
        </div>
        <div className="card px-4 py-3 min-w-[150px]">
          <p className="text-[11px] uppercase tracking-wider text-inkSoft">Completed</p>
          <p className="font-mono text-2xl font-medium text-ink">
            {completedForDeck.length}/{questions.length}
          </p>
        </div>
      </div>

      <section className="card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="font-display font-semibold text-base">Resume-based questions</h2>
            <p className="text-xs text-inkSoft mt-1">
              Save your own resume and generate private questions for your account.
            </p>
          </div>
          {savedResume && (
            <span className="badge bg-brand2Soft text-[#0d8f81]">
              Saved resume
            </span>
          )}
        </div>

        <form onSubmit={generateFromResume} className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
          <div>
            <label className="label" htmlFor="resume-file">
              Upload resume
            </label>
            <label
              htmlFor="resume-file"
              className={clsx(
                "flex min-h-[78px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-3 py-3 text-center transition-colors",
                isDraggingResume
                  ? "border-brand bg-brandSoft text-brand"
                  : "border-border bg-surfaceMuted/35 text-inkSoft hover:border-brand/50 hover:bg-brandSoft/40"
              )}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingResume(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDraggingResume(false)}
              onDrop={handleResumeDrop}
            >
              <UploadIcon className="mb-1 h-4 w-4" />
              <span className="text-xs font-semibold text-ink">Drop file or browse</span>
              <span className="mt-0.5 text-[11px]">TXT, MD, or CSV</span>
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
              className="sr-only"
              onChange={handleResumeFile}
            />
            {resumeFilename && (
              <p className="mt-1 text-xs text-inkSoft truncate">{resumeFilename}</p>
            )}
            {resumeError && (
              <p className="mt-2 rounded-md border border-red/20 bg-redSoft px-3 py-2 text-xs text-red">
                {resumeError}
              </p>
            )}
          </div>
          <button className="btn-primary mt-6 whitespace-nowrap" type="submit" disabled={isGenerating || !resumeText.trim()}>
            <SparkIcon className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </form>
      </section>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <section className="card overflow-hidden">
          <div className="h-2 bg-surfaceMuted">
            <div
              className={clsx(
                "h-full transition-all duration-500",
                isTimeUp ? "bg-red" : secondsLeft <= 30 ? "bg-amber" : "bg-brand2"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {activeQuestion ? (
                <span className="badge bg-brandSoft text-brand">
                  {activeQuestion.category}
                </span>
              ) : (
                <span className="badge bg-surfaceMuted text-inkSoft">No questions</span>
              )}
              <div
                className={clsx(
                  "font-mono text-4xl sm:text-5xl font-medium tabular-nums",
                  isTimeUp ? "text-red" : secondsLeft <= 30 ? "text-amber" : "text-ink"
                )}
              >
                {formatTime(secondsLeft)}
              </div>
            </div>

            <div className="min-h-[280px] flex flex-col justify-center py-8">
              {activeQuestion ? (
                <>
                  <p className="text-sm font-medium uppercase tracking-wider text-inkSoft mb-4">
                    Question {activeIndex + 1} of {questions.length}
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight">
                    {activeQuestion.prompt}
                  </h2>
                  <div className="mt-6 rounded-lg border border-border bg-surfaceMuted/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">
                      Answer focus
                    </p>
                    <p className="text-sm text-ink">{activeQuestion.focus}</p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-surfaceMuted/35 p-6 text-center">
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Add your first mock question
                  </h2>
                  <p className="text-sm text-inkSoft mt-2">
                    Questions now come from the Supabase table. Use the form to save the first one.
                  </p>
                </div>
              )}
            </div>

            {isTimeUp && (
              <div className="mb-5 rounded-lg border border-red/20 bg-redSoft px-4 py-3 text-sm text-red">
                Time is up. Wrap your answer, mark the card complete, or reset the timer and try again.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="btn-primary"
                onClick={() => setIsRunning((current) => !current)}
                disabled={isTimeUp || !activeQuestion}
              >
                {isRunning ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                {isRunning ? "Pause" : secondsLeft === ANSWER_SECONDS ? "Start" : "Resume"}
              </button>
              <button className="btn-ghost" onClick={resetTimer} disabled={!activeQuestion}>
                <ResetIcon className="h-4 w-4" />
                Reset
              </button>
              <button className="btn-ghost" onClick={markDone} disabled={!activeQuestion}>
                <CheckIcon className="h-4 w-4" />
                Mark done
              </button>
              <button className="btn-primary ml-0 sm:ml-auto" onClick={nextQuestion} disabled={!activeQuestion}>
                Next question
                <ArrowIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <aside className="card p-4 xl:sticky xl:top-7">
          <form onSubmit={addQuestion} className="mb-5 rounded-lg border border-border bg-surfaceMuted/35 p-3">
            <h2 className="font-display font-semibold text-base mb-3">Add mock question</h2>
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="question-category">
                  Category
                </label>
                <input
                  id="question-category"
                  className="input h-9"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="Behavioral"
                />
              </div>
              <div>
                <label className="label" htmlFor="question-prompt">
                  Question
                </label>
                <textarea
                  id="question-prompt"
                  className="input min-h-[88px] resize-none"
                  value={newPrompt}
                  onChange={(event) => setNewPrompt(event.target.value)}
                  placeholder="Tell me about a time..."
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="question-focus">
                  Answer focus
                </label>
                <textarea
                  id="question-focus"
                  className="input min-h-[72px] resize-none"
                  value={newFocus}
                  onChange={(event) => setNewFocus(event.target.value)}
                  placeholder="What should the answer include?"
                />
              </div>
              <button className="btn-primary w-full" type="submit">
                <PlusIcon className="h-4 w-4" />
                {isSaving ? "Saving..." : "Add question"}
              </button>
              {saveError && (
                <div className="rounded-md border border-red/20 bg-redSoft px-3 py-2 text-xs text-red">
                  {saveError}
                </div>
              )}
            </div>
          </form>

          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-display font-semibold text-lg">Question deck</h2>
            <button
              className="text-xs font-medium text-inkSoft hover:text-ink"
              onClick={() => {
                setCompleted((current) => ({ ...current, [deckMode]: [] }));
                if (questions[0]) selectQuestion(0);
              }}
            >
              Clear
            </button>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-border/60 bg-surfaceMuted/40 p-1">
            <button
              type="button"
              onClick={() => switchDeck("manual")}
              className={clsx(
                "rounded-md px-3 py-2 text-xs font-semibold transition-colors",
                deckMode === "manual" ? "bg-surface text-ink shadow-sm" : "text-inkSoft hover:text-ink"
              )}
            >
              General ({manualQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => switchDeck("resume")}
              className={clsx(
                "rounded-md px-3 py-2 text-xs font-semibold transition-colors",
                deckMode === "resume" ? "bg-surface text-ink shadow-sm" : "text-inkSoft hover:text-ink"
              )}
            >
              My resume ({resumeQuestions.length})
            </button>
          </div>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 kanban-scroll">
            {questions.length === 0 && (
              <div className="rounded-md border border-dashed border-border bg-surfaceMuted/35 px-3 py-4 text-sm text-inkSoft">
                No saved questions yet.
              </div>
            )}
            {questions.map((question, index) => {
              const active = index === activeIndex;
              const done = completedForDeck.includes(index);

              return (
                <button
                  key={question.prompt}
                  className={clsx(
                    "w-full text-left rounded-md border px-3 py-3 transition-colors",
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-border bg-surface hover:bg-surfaceMuted text-ink"
                  )}
                  onClick={() => selectQuestion(index)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                      {question.category}
                    </span>
                    {done && <CheckIcon className="h-4 w-4 shrink-0" />}
                  </span>
                  <span className="mt-1 block text-sm font-medium leading-snug">
                    {question.prompt}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" fill="currentColor" />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 12a8 8 0 101.9-5.2M4 4v5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12.5l4 4L19 7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 16V4M7 9l5-5 5 5M5 20h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
