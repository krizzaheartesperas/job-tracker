"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { STATUS_LABELS, type Status } from "@/lib/types";

type Result = {
  action: "created" | "updated" | "created_possible_duplicate";
  company: string;
  record: {
    role: string;
    status: Status;
    notes: string;
  };
};

export default function EmailImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function processFile(file: File) {
    setError("");
    setResult(null);
    setPreviewUrl(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/parse-email-screenshot", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong reading that screenshot.");
      }

      setResult(data as Result);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  }

  function reset() {
    setResult(null);
    setError("");
    setPreviewUrl(null);
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (isProcessing) return;
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            processFile(file);
          }
          return;
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isProcessing]);

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-2xl mb-1 tracking-tight">
          Import from email screenshot
        </h2>
        <p className="text-sm text-inkSoft mb-5">
          Drop, browse, or paste (Ctrl+V) a screenshot of an application confirmation, interview
          invite, or rejection — it'll extract the details and update your tracker automatically.
        </p>

        {!result && (
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isProcessing && inputRef.current?.click()}
            className={clsx(
              "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
              isDragging
                ? "border-brand bg-brandSoft text-brand"
                : "border-border bg-surfaceMuted/35 text-inkSoft hover:border-brand/50 hover:bg-brandSoft/40",
              isProcessing && "pointer-events-none opacity-70"
            )}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Screenshot preview"
                className="mb-3 max-h-32 rounded-md border border-border/60 object-contain"
              />
            ) : (
              <UploadIcon className="mb-2 h-6 w-6" />
            )}

            {isProcessing ? (
              <>
                <span className="text-sm font-semibold text-ink">Reading screenshot…</span>
                <span className="mt-1 text-xs">Extracting, classifying, and checking for duplicates</span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-ink">Drop, browse, or paste (Ctrl+V)</span>
                <span className="mt-1 text-xs">PNG, JPEG, WEBP, or GIF</span>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="sr-only"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-md border border-red/20 bg-redSoft px-3 py-2 text-sm text-red">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div
              className={clsx(
                "rounded-lg border p-4",
                result.action === "created_possible_duplicate"
                  ? "border-amber/30 bg-amberSoft/50"
                  : "border-brand2/30 bg-brand2Soft"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-1">
                {result.action === "updated"
                  ? "Existing application updated"
                  : result.action === "created_possible_duplicate"
                  ? "New row added — check for duplicates"
                  : "New application added"}
              </p>
              <p className="font-display font-semibold text-lg text-ink">
                {result.record.role} · {result.company}
              </p>
              <p className="text-xs text-inkSoft mt-1">
                Status: <span className="font-medium text-ink">{STATUS_LABELS[result.record.status]}</span>
              </p>
              {result.record.notes && (
                <p className="text-sm text-ink/90 mt-2 whitespace-pre-wrap">{result.record.notes}</p>
              )}
            </div>
            <button className="btn-ghost w-full" onClick={reset}>
              Import another screenshot
            </button>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="btn-ghost">
            {result ? "Done" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
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
