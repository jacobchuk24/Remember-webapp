import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";

export default async function SundayHub({ params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("church_id").eq("id", user.id).single();
  const { data: church } = await supabase.from("churches").select("*").eq("id", profile.church_id).single();
  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, title, speaker, date, status, series:series_id(name)")
    .eq("church_id", profile.church_id)
    .order("created_at", { ascending: false });

  const palette = derivePalette(church);
  const published = (sermons || []).filter((s) => s.status === "published");
  const drafts = (sermons || []).filter((s) => s.status === "draft");

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: palette.forest, margin: "0 0 20px" }}>Sunday Hub</h1>
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <div style={{ border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 12, padding: 16, flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: palette.forest }}>{published.length}</div>
          <div style={{ fontSize: 11.5, color: palette.charcoalSoft }}>Published</div>
        </div>
        <div style={{ border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 12, padding: 16, flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: palette.forest }}>{drafts.length}</div>
          <div style={{ fontSize: 11.5, color: palette.charcoalSoft }}>Drafts</div>
        </div>
      </div>

      
