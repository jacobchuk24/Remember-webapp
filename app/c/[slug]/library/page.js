import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";

export default async function LibraryPage({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  if (!church) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/c/${params.slug}/login`);

  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, title, date, series:series_id(id, name)")
    .eq("church_id", church.id)
    .eq("status", "published")
    .order("date", { ascending: false });

  const palette = derivePalette(church);
  const bySeries = {};
  (sermons || []).forEach((s) => {
    const name = s.series?.name || "General";
    bySeries[name] = bySeries[name] || [];
    bySeries[name].push(s);
  });

  return (
    <div style={{ minHeight: "100vh", background: palette.cream, fontFamily: "'Public Sans', sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Link href={`/c/${params.slug}`} style={{ fontSize: 12, color: palette.forest, textDecoration: "none" }}>← Home</Link>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: palette.forest, margin: "10px 0 20px" }}>Library</h1>
        {Object.entries(bySeries).map(([name, list]) => (
          <div key={name} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: palette.charcoalSoft, fontWeight: 600, marginBottom: 10 }}>{name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((s) => (
                <Link key={s.id} href={`/c/${params.slug}/notes/${s.id}`} style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, border: `1px solid ${palette.line}`, background: "#fff", color: palette.charcoal, fontSize: 13.5 }}>
                  <span style={{ fontWeight: 600 }}>{s.title}</span>
                  <span style={{ color: palette.charcoalSoft }}>{s.date}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {(!sermons || sermons.length === 0) && <p style={{ fontSize: 13, color: palette.charcoalSoft, fontStyle: "italic" }}>Nothing published yet.</p>}
      </div>
    </div>
  );
}
