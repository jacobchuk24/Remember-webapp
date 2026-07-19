import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";

export default async function SundayHub({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, title, speaker, date, status, series:series_id(name)")
    .eq("church_id", church.id)
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

      <a href={`/c/${params.slug}/admin/create`} style={{ display: "inline-block", textDecoration: "none", background: palette.forest, color: palette.onForest, borderRadius: 999, padding: "11px 20px", fontSize: 13.5, fontWeight: 600, marginBottom: 26 }}>
        + Create Message
      </a>

      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: palette.charcoalSoft, fontWeight: 600, marginBottom: 10 }}>All Messages</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(sermons || []).map((s) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 12, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: palette.charcoal }}>{s.title}</span>
            <span style={{ color: palette.charcoalSoft }}>{s.series?.name} · {s.date} · {s.status}</span>
          </div>
        ))}
        {(!sermons || sermons.length === 0) && <p style={{ fontSize: 13, color: palette.charcoalSoft, fontStyle: "italic" }}>No messages yet.</p>}
      </div>
    </div>
  );
}
