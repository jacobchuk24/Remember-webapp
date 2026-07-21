import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";
import PrayerClient from "./prayer-client";

export default async function PrayerPage({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  if (!church) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/c/${params.slug}/login`);

  const { data: prayers } = await supabase
    .from("prayers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <PrayerClient palette={derivePalette(church)} slug={params.slug} initialPrayers={prayers || []} />;
}
