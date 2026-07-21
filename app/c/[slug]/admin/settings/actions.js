"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateChurchBranding({ churchId, slug, name, primaryColor, accentColor, backgroundColor }) {
  const supabase = createClient();
  const { error } = await supabase
    .from("churches")
    .update({
      name,
      primary_color: primaryColor,
      accent_color: accentColor,
      background_color: backgroundColor,
    })
    .eq("id", churchId);
  if (error) throw new Error(error.message);

  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/library`);
  revalidatePath(`/c/${slug}/admin`);
  revalidatePath(`/c/${slug}/admin/settings`);
}
