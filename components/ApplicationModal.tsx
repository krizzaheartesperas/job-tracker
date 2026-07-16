"use client";

import { useState } from "react";
import { createApplication, updateApplication, deleteApplication } from "@/lib/actions";
import { STATUSES, STATUS_LABELS, type Application, type ApplicationInput } from "@/lib/types";

const emptyForm: ApplicationInput = {
  company: "",
  role: "",
  status: "applied",
  applied_date: new Date().toISOString().slice(0, 10),
  follow_up_date: null,
  location: "",
  job_url: "",
  salary: "",
  notes: "",
};

export default function ApplicationModal({
  application,
  onClose,
}: {
  application?: Application;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ApplicationInput>(
    application
      ? {
          company: application.company,
          role: application.role,
          status: application.status,
          applied_date: application.applied_date,
          follow_up_date: application.follow_up_date,
          location: application.location,
          job_url: application.job_url,
          salary: application.salary,
          notes: application.notes,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (application) {
        await updateApplication(application.id, form);
      } else {
        await createApplication(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!application) return;
    if (!confirm(`Remove ${application.company} — ${application.role}?`)) return;
    setSaving(true);
    try {
      await deleteApplication(application.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-2xl mb-5 tracking-tight">
          {application ? "Edit application" : "New application"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company</label>
              <input
                required
                className="input"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="label">Role</label>
              <input
                required
                className="input"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="Frontend Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => set("status", e.target.value as ApplicationInput["status"])}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                value={form.location ?? ""}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Remote / City"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Applied date</label>
              <input
                type="date"
                required
                className="input"
                value={form.applied_date}
                onChange={(e) => set("applied_date", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Follow-up date</label>
              <input
                type="date"
                className="input"
                value={form.follow_up_date ?? ""}
                onChange={(e) => set("follow_up_date", e.target.value || null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Job posting URL</label>
              <input
                className="input"
                value={form.job_url ?? ""}
                onChange={(e) => set("job_url", e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="label">Salary / range</label>
              <input
                className="input"
                value={form.salary ?? ""}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="$120k–140k"
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[80px]"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Referral from…, recruiter contact, interview prep notes…"
            />
          </div>

          {error && (
            <p className="text-sm text-red bg-redSoft rounded-sm px-3 py-2">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            {application ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="text-sm text-red hover:underline"
              >
                Delete application
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving…" : application ? "Save changes" : "Add application"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
