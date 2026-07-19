import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";
import SermonForm from "../../create/sermon-form";

export default async function EditMessagePage({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  if (!church) notFound();

  const { data: series } = await supabase.from("series").select("id, name").eq("church_id", church.id).order("name");
  const { data: sermon } = await supabase
    .from("sermons")
    .select("id, title, speaker, date, description, blocks, series_id, status")
    .eq("id", params.sermonId)
    .eq("church_id", church.id)
    .single();
  if (!sermon) notFound();

  return <SermonForm palette={derivePalette(church)} churchId={church.id} slug={params.slug} seriesList={series || []} existingSermon={sermon} />;
}
