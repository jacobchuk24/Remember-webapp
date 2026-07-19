"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSeries(churchId, name) {
  const supabase = createClient();
  const { data, error } = await supabase.from("series").insert({ church_id: churchId, name }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveSermon({ churchId, slug, seriesId, title, speaker, date, description, blocks, status }) {
  const supabase = createClient();
  const { error } = await supabase.from("sermons").insert({
    church_id: churchId,
    series_id: seriesId,
    title,
    speaker,
    date,
    description,
    blocks,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/library`);
  revalidatePath(`/c/${slug}/admin`);
}
