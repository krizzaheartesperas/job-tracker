"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MOTIVATIONAL_QUOTES = [
  "Every application is a step closer to your dream role!",
  "You've got this — your next opportunity is waiting!",
  "Small steps every day lead to big career wins!",
  "Rejection is redirection. Keep going!",
  "Your skills are valuable. The right company will see it!",
  "Today's effort is tomorrow's offer letter!",
  "Believe in yourself — you're building something great!",
  "The trail ahead is yours. Keep climbing!",
  "Progress, not perfection. You're doing amazing!",
  "One more application could change everything!",
];

function CuteMascot() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-40 h-40 sm:w-48 sm:h-48 mx-auto"
      aria-hidden="true"
    >
      <circle cx="35" cy="45" r="4" fill="#F5A524" className="animate-sparkle" style={{ animationDelay: "0s" }} />
      <circle cx="165" cy="55" r="3" fill="#14B8A6" className="animate-sparkle" style={{ animationDelay: "0.4s" }} />
      <circle cx="170" cy="120" r="3.5" fill="#8B5CF6" className="animate-sparkle" style={{ animationDelay: "0.8s" }} />
      <circle cx="30" cy="130" r="3" fill="#5B5FEF" className="animate-sparkle" style={{ animationDelay: "1.2s" }} />

      <ellipse cx="100" cy="175" rx="45" ry="8" fill="#14161F" opacity="0.08" className="animate-shadow-pulse" />

      <g className="animate-mascot-bounce">
        <ellipse cx="82" cy="148" rx="12" ry="8" fill="#5B5FEF" />
        <ellipse cx="118" cy="148" rx="12" ry="8" fill="#5B5FEF" />
        <ellipse cx="100" cy="115" rx="38" ry="42" fill="#5B5FEF" />
        <ellipse cx="100" cy="118" rx="32" ry="36" fill="#6B6FF5" />
        <rect x="128" y="95" width="22" height="28" rx="6" fill="#14B8A6" />
        <rect x="131" y="100" width="16" height="4" rx="2" fill="#DFF7F3" />
        <path d="M128 100 Q120 95 115 100" stroke="#14B8A6" strokeWidth="3" fill="none" strokeLinecap="round" />

        <g className="origin-[145px_105px] animate-wave-arm">
          <ellipse cx="145" cy="105" rx="10" ry="14" fill="#5B5FEF" transform="rotate(-20 145 105)" />
          <circle cx="158" cy="88" r="11" fill="#FFD4B8" />
        </g>

        <ellipse cx="58" cy="108" rx="10" ry="14" fill="#5B5FEF" transform="rotate(20 58 108)" />
        <circle cx="100" cy="88" r="34" fill="#FFD4B8" />
        <circle cx="78" cy="98" r="7" fill="#FFB4A2" opacity="0.5" />
        <circle cx="122" cy="98" r="7" fill="#FFB4A2" opacity="0.5" />
        <ellipse cx="88" cy="85" rx="5" ry="6" fill="#14161F" />
        <ellipse cx="112" cy="85" rx="5" ry="6" fill="#14161F" />
        <circle cx="90" cy="83" r="2" fill="white" />
        <circle cx="114" cy="83" r="2" fill="white" />
        <path d="M88 98 Q100 108 112 98" stroke="#14161F" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        <line x1="100" y1="54" x2="100" y2="68" stroke="#14161F" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M100 54 L130 60 L100 66 Z"
          fill="#14B8A6"
          className="animate-flag-wave"
          style={{ transformOrigin: "100px 60px" }}
        />
      </g>
    </svg>
  );
}

export default function WelcomePopup() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);
  const [closing, setClosing] = useState(false);
  const [quote] = useState(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  function dismiss() {
    setClosing(true);
    setTimeout(() => setOpen(false), 300);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-sm bg-surface rounded-xl shadow-softLg overflow-hidden ${
          closing ? "animate-popup-out" : "animate-popup-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 bg-brand-gradient" />

        <div className="px-6 pt-4 pb-6 text-center">
          <CuteMascot />

          <p className="text-xs font-medium uppercase tracking-widest text-brand2 mb-2 opacity-0 animate-fade-up">
            Welcome back!
          </p>

          <h2
            id="welcome-title"
            className="font-display font-semibold text-xl sm:text-2xl text-ink tracking-tight mb-3 opacity-0 animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            Ready to conquer the trail?
          </h2>

          <p
            className="text-sm text-inkSoft leading-relaxed mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            {quote}
          </p>

          <button
            type="button"
            onClick={dismiss}
            className="btn-primary w-full opacity-0 animate-fade-up"
            style={{ animationDelay: "0.45s" }}
          >
            Let&apos;s go!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
