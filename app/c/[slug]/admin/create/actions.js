"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSeries(churchId, name) {
  const supabase = createClient();
  const { data, error } = await supabase.from("series").insert({ church_id: churchId, name }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveSermon({ id, churchId, slug, seriesId, title, speaker, date, description, blocks, status }) {
  const supabase = createClient();
  const payload = { church_id: churchId, series_id: seriesId, title, speaker, date, description, blocks, status };

  if (id) {
    if (status === "published") {
      const { data: existing } = await supabase.from("sermons").select("published_at").eq("id", id).single();
      if (!existing?.published_at) payload.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("sermons").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    payload.published_at = status === "published" ? new Date().toISOString() : null;
    const { error } = await supabase.from("sermons").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/library`);
  revalidatePath(`/c/${slug}/admin`);
}
