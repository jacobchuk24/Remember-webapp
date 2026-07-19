import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";
import SermonForm from "./sermon-form";

export default async function CreateMessagePage({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  const { data: series } = await supabase.from("series").select("id, name").eq("church_id", church.id).order("name");

  return <SermonForm palette={derivePalette(church)} churchId={church.id} slug={params.slug} seriesList={series || []} />;
}
