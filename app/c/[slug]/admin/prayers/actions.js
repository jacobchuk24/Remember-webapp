"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminToggleAnswered({ slug, id, answered }) {
  const supabase = createClient();
  const { error } = await supabase.from("prayers").update({ answered }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/c/${slug}/admin/prayers`);
}
