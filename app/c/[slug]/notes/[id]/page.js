import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";
import NotesEditor from "./notes-editor";

export default async function SermonNotesPage({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  if (!church) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/c/${params.slug}/login`);

  const { data: sermon } = await supabase
    .from("sermons")
    .select("id, title, speaker, date, description, blocks, series:series_id(name)")
    .eq("id", params.id)
    .eq("church_id", church.id)
    .eq("status", "published")
    .single();
  if (!sermon) notFound();

  const { data: existingNotes } = await supabase
    .from("sermon_notes")
    .select("answers")
    .eq("user_id", user.id)
    .eq("sermon_id", sermon.id)
    .maybeSingle();
  const { data: completion } = await supabase
    .from("completions")
    .select("id")
    .eq("user_id", user.id)
    .eq("sermon_id", sermon.id)
    .maybeSingle();

  return (
    <NotesEditor
      palette={derivePalette(church)}
      sermon={sermon}
      slug={params.slug}
      initialAnswers={existingNotes?.answers || {}}
      alreadyCompleted={!!completion}
    />
  );
}
