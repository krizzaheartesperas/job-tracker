"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setNotice("Account created. Check your inbox to confirm your email, then sign in.");
      setMode("sign-in");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-90" />
        <div className="absolute inset-0 bg-ink/40" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-brand-gradient shadow-glow" />
            <span className="font-mono text-xs uppercase tracking-wider text-white/60">
              Kei and Mere&apos;s Tracker
            </span>
          </div>
          <h1 className="font-display font-semibold text-5xl mt-8 leading-[1.1] tracking-tight">
            Track every
            <br />
            application,
            <br />
            <span className="text-gradient">end to end.</span>
          </h1>
          <p className="mt-6 max-w-sm text-white/70 text-sm leading-relaxed">
            Company, stage, and the follow-ups you can&apos;t afford to miss —
            all in one clean pipeline.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-10">
          <div>
            <p className="font-mono text-lg font-semibold text-gradient">Visual</p>
            <p className="text-xs uppercase tracking-wide text-white/50">Kanban Board</p>
          </div>
          <div>
            <p className="font-mono text-lg font-semibold text-gradient">Smart</p>
            <p className="text-xs uppercase tracking-wide text-white/50">Analytics</p>
          </div>
          <div>
            <p className="font-mono text-lg font-semibold text-gradient">Timely</p>
            <p className="text-xs uppercase tracking-wide text-white/50">Reminders</p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-brand-gradient" />
              <span className="font-mono text-xs uppercase tracking-wider text-inkSoft">
                Kei and Mere&apos;s Tracker
              </span>
            </div>
            <h1 className="font-display font-semibold text-3xl mt-2">Job tracker</h1>
          </div>

          <div className="card p-8">
            <h2 className="font-display font-semibold text-2xl mb-1 tracking-tight">
              {mode === "sign-in" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm text-inkSoft mb-6">
              {mode === "sign-in"
                ? "Sign in to see where things stand."
                : "Set a password to start tracking applications."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="input pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-inkSoft hover:text-ink transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red bg-redSoft rounded-sm px-3 py-2">{error}</p>
              )}
              {notice && (
                <p className="text-sm text-brand bg-brandSoft rounded-sm px-3 py-2">{notice}</p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading
                  ? "Please wait…"
                  : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            <button
              className="mt-5 text-sm text-inkSoft hover:text-ink underline underline-offset-2 w-full text-center"
              onClick={() => {
                setError(null);
                setNotice(null);
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              }}
            >
              {mode === "sign-in"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
