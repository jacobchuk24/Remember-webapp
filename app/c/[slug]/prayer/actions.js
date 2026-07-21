"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPrayer({ slug, text }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const clean = text.trim();
  if (!clean) return;
  const { error } = await supabase.from("prayers").insert({ user_id: user.id, text: clean });
  if (error) throw new Error(error.message);
  revalidatePath(`/c/${slug}/prayer`);
}

export async function toggleAnswered({ slug, id, answered }) {
  const supabase = createClient();
  const { error } = await supabase.from("prayers").update({ answered }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/c/${slug}/prayer`);
}
