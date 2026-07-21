import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";
import SettingsForm from "./settings-form";

export default async function SettingsPage({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  if (!church) notFound();

  return <SettingsForm palette={derivePalette(church)} church={church} slug={params.slug} />;
}
