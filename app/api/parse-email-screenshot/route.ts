import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, type Status } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// Vision + tool-use capable model on Groq. See console.groq.com/docs/vision.
const MODEL = "qwen/qwen3.6-27b";

const RECORD_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "record_job_email",
    description:
      "Record the structured job-application details extracted from a screenshot of an email.",
    parameters: {
      type: "object",
      properties: {
        company: {
          type: "string",
          description:
            "The hiring company's name only — no location, salary, or job-board boilerplate glued on.",
        },
        role: {
          type: "string",
          description: "The job title / role being applied for.",
        },
        status: {
          type: "string",
          enum: STATUSES,
          description:
            "applied = application confirmation/received. screening = recruiter/phone screen or assessment invite. interview = interview invite/scheduling. offer = job offer. rejected = rejection/not moving forward. withdrawn = candidate withdrew.",
        },
        applied_date: {
          type: ["string", "null"],
          description: "ISO date (YYYY-MM-DD) the email explicitly states as the application date, else null.",
        },
        follow_up_date: {
          type: ["string", "null"],
          description: "ISO date (YYYY-MM-DD) of any explicitly mentioned next step/deadline/interview date, else null.",
        },
        notes: {
          type: "string",
          description:
            "A concise 1-2 sentence summary of the action and next step, written for a job tracker notes field.",
        },
      },
      required: ["company", "role", "status", "applied_date", "follow_up_date", "notes"],
      additionalProperties: false,
    },
  },
};

const EXTRACTION_PROMPT = `This image is a screenshot of an email related to a job application.

Step 1 — Extract & isolate: read only the actual email body text. Ignore ads, promotional banners, email client chrome, browser tabs/bars, signatures/footers, and unrelated UI.

Step 2 — Classify intent: determine what kind of update this is (application confirmation, assessment/interview invite, rejection, offer, etc.) and map it to the status enum on the tool.

Step 3 — Map to schema: fill in company (clean name only), role, status, applied_date/follow_up_date if explicitly stated, and a short notes summary of the next step.

Call record_job_email with the result. If a field isn't present in the email, use null (for dates) or your best inference from context (for company/role).`;

type ExtractedRecord = {
  company: string;
  role: string;
  status: Status;
  applied_date: string | null;
  follow_up_date: string | null;
  notes: string;
};

async function extractFromImage(base64: string, mimeType: string): Promise<ExtractedRecord> {
  const groq = new Groq();

  const completion = await groq.chat.completions.create({
    model: MODEL,
    reasoning_effort: "none",
    tools: [RECORD_TOOL],
    tool_choice: { type: "function", function: { name: "record_job_email" } },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
        ],
      },
    ],
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("Model did not return a structured extraction.");
  }

  return JSON.parse(toolCall.function.arguments) as ExtractedRecord;
}

async function findExistingApplication(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  company: string
) {
  const clean = company.trim();

  const exact = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .ilike("company", clean);
  if (exact.error) throw new Error(exact.error.message);
  if (exact.data.length === 1) return { match: exact.data[0], ambiguous: false };
  if (exact.data.length > 1) return { match: null, ambiguous: true };

  const fuzzy = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .ilike("company", `%${clean}%`);
  if (fuzzy.error) throw new Error(fuzzy.error.message);
  if (fuzzy.data.length === 1) return { match: fuzzy.data[0], ambiguous: false };
  if (fuzzy.data.length > 1) return { match: null, ambiguous: true };

  return { match: null, ambiguous: false };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file uploaded." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type "${file.type}". Upload a PNG, JPEG, WEBP, or GIF screenshot.` },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 8MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  let record: ExtractedRecord;
  try {
    record = await extractFromImage(base64, file.type);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read the screenshot." },
      { status: 502 }
    );
  }

  if (!record.company || !record.role) {
    return NextResponse.json(
      { error: "Could not identify a company/role in this screenshot.", record },
      { status: 422 }
    );
  }

  const { match, ambiguous } = await findExistingApplication(supabase, user.id, record.company);
  const today = new Date().toISOString().slice(0, 10);
  const noteLine = record.notes ? `[${today}] ${record.notes}` : null;

  if (match) {
    const mergedNotes = [match.notes, noteLine].filter(Boolean).join("\n");
    const { error } = await supabase
      .from("applications")
      .update({
        status: record.status,
        notes: mergedNotes || null,
        follow_up_date: record.follow_up_date ?? match.follow_up_date,
      })
      .eq("id", match.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return NextResponse.json({ action: "updated", company: match.company, record });
  }

  const flaggedNotes = ambiguous
    ? [`[Possible duplicate — multiple similar companies found, please review]`, noteLine]
        .filter(Boolean)
        .join("\n")
    : noteLine;

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company: record.company,
    role: record.role,
    status: record.status,
    applied_date: record.applied_date ?? today,
    follow_up_date: record.follow_up_date,
    notes: flaggedNotes,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return NextResponse.json({
    action: ambiguous ? "created_possible_duplicate" : "created",
    company: record.company,
    record,
  });
}
