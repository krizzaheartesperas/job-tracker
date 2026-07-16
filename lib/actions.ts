"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationInput, Status } from "@/lib/types";

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

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
