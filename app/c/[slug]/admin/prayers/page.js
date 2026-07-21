import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";
import PrayersClient from "./prayers-client";

export default async function AdminPrayersPage({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("church_id").eq("id", user.id).single();
  const { data: church } = await supabase.from("churches").select("*").eq("id", profile.church_id).single();

  const { data: members } = await supabase.from("profiles").select("id, display_name").eq("church_id", profile.church_id);
  const memberIds = (members || []).map((m) => m.id);
  const nameById = Object.fromEntries((members || []).map((m) => [m.id, m.display_name || "A member"]));

  const { data: prayers } = memberIds.length
    ? await supabase.from("prayers").select("*").in("user_id", memberIds).order("created_at", { ascending: false })
    : { data: [] };

  const withNames = (prayers || []).map((p) => ({ ...p, memberName: nameById[p.user_id] || "A member" }));

  return <PrayersClient palette={derivePalette(church)} slug={params.slug} initialPrayers={withNames} />;
}
