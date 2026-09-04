// Visual Email Parsing Pipeline — backend half.
//
// Claude reads the email screenshot, extracts + classifies + maps the fields
// (steps 1-3 of the pipeline), then hands the resulting JSON record to this
// script, which does the parts that need real data access:
//   4. Dedup against the existing tracker (match by company, case-insensitive)
//   5. Insert a new row or update + append notes on the existing one, then
//      print the full, current tracker table.
//
// Uses the Supabase service-role key (server-only, never NEXT_PUBLIC_) so it
// bypasses RLS entirely — this script must only ever be run locally by you,
// never shipped as part of the deployed app.
//
// Usage:
//   node scripts/email-pipeline.mjs apply '{"company":"Acme","role":"Frontend Engineer","status":"interview","notes":"Recruiter screen scheduled for Tuesday."}'
//   node scripts/email-pipeline.mjs list

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_DISPLAY_NAME = process.env.PIPELINE_OWNER ?? "Kei";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add SUPABASE_SERVICE_ROLE_KEY=<service_role secret> to .env.local (do NOT prefix it with NEXT_PUBLIC_)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function getOwnerUserId(displayName) {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .ilike("display_name", displayName)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`No profile found for display_name "${displayName}".`);
  return data.user_id;
}

async function findExistingApplication(userId, company) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .ilike("company", company.trim());
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

async function upsertFromEmail(record) {
  if (!record.company || !record.status) {
    throw new Error('Record needs at least "company" and "status".');
  }

  const userId = await getOwnerUserId(OWNER_DISPLAY_NAME);
  const existing = await findExistingApplication(userId, record.company);
  const today = new Date().toISOString().slice(0, 10);
  const noteLine = record.notes ? `[${today}] ${record.notes}` : null;

  if (existing) {
    const mergedNotes = [existing.notes, noteLine].filter(Boolean).join("\n");
    const { error } = await supabase
      .from("applications")
      .update({
        status: record.status,
        notes: mergedNotes || null,
        follow_up_date: record.follow_up_date ?? existing.follow_up_date,
        role: existing.role || record.role || existing.role,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { action: "updated", company: record.company };
  }

  const { error } = await supabase.from("applications").insert({
    user_id: userId,
    company: record.company,
    role: record.role ?? "(role unknown)",
    status: record.status,
    applied_date: record.applied_date ?? today,
    follow_up_date: record.follow_up_date ?? null,
    location: record.location ?? null,
    job_url: record.job_url ?? null,
    salary: record.salary ?? null,
    notes: noteLine,
  });
  if (error) throw new Error(error.message);
  return { action: "created", company: record.company };
}

function toTable(rows) {
  if (rows.length === 0) return "(no applications yet)";
  const cols = ["applied_date", "company", "role", "status", "follow_up_date", "notes"];
  const header = ["Date", "Company", "Job Title", "Status", "Follow-up", "Notes / Next Steps"];
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[cols[i]] ?? "").split("\n")[0].length))
  );
  const pad = (s, w) => String(s ?? "").padEnd(w);
  const sep = widths.map((w) => "-".repeat(w)).join("-|-");
  const lines = [
    header.map((h, i) => pad(h, widths[i])).join(" | "),
    sep,
    ...rows.map((r) =>
      cols.map((c, i) => pad(String(r[c] ?? "").split("\n")[0], widths[i])).join(" | ")
    ),
  ];
  return lines.join("\n");
}

async function printTable() {
  const userId = await getOwnerUserId(OWNER_DISPLAY_NAME);
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("applied_date", { ascending: false });
  if (error) throw new Error(error.message);
  console.log(toTable(data ?? []));
  console.log(`\n(${(data ?? []).length} total application${(data ?? []).length === 1 ? "" : "s"} for ${OWNER_DISPLAY_NAME})`);
}

const [, , mode, jsonArg] = process.argv;

(async () => {
  try {
    if (mode === "apply") {
      if (!jsonArg) throw new Error("Missing JSON record argument.");
      const record = JSON.parse(jsonArg);
      const result = await upsertFromEmail(record);
      console.log(`>> ${result.action.toUpperCase()}: ${result.company}\n`);
      await printTable();
    } else if (mode === "list") {
      await printTable();
    } else {
      console.error("Usage:\n  node scripts/email-pipeline.mjs apply '<json record>'\n  node scripts/email-pipeline.mjs list");
      process.exit(1);
    }
  } catch (err) {
    console.error("ERROR:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
