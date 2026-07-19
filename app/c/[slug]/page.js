import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";

export default async function ChurchHomePage({ params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  if (!church) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/c/${params.slug}/login`);

  const { data: profile } = await supabase.from("profiles").select("church_id").eq("id", user.id).maybeSingle();
  const palette = derivePalette(church);

  if (!profile || profile.church_id !== church.id) {
    return (
      <div style={{ minHeight: "100vh", background: palette.cream, fontFamily: "'Public Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
        <div>
          <p style={{ fontSize: 14, color: palette.charcoal, marginBottom: 8 }}>This account isn't a member of {church.name}.</p>
          <p style={{ fontSize: 12.5, color: palette.charcoalSoft }}>Sign in with a different email, or ask your church for an invite.</p>
        </div>
      </div>
    );
  }

  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, title, speaker, date, series:series_id(name)")
    .eq("church_id", church.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  const { data: completions } = await supabase.from("completions").select("sermon_id").eq("user_id", user.id);
  const completedIds = new Set((completions || []).map((c) => c.sermon_id));
  const featured = sermons?.[0];

  return (
    <div style={{ minHeight: "100vh", background: palette.cream, fontFamily: "'Public Sans', sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 26, color: palette.forest }}>Remember</span>
          <span style={{ fontSize: 11, color: palette.charcoalSoft }}>{church.name}</span>
        </div>
        <p style={{ fontSize: 13, color: palette.charcoalSoft, fontStyle: "italic", marginBottom: 24 }}>
          Helping you remember what God has taught you.
        </p>

        <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: palette.charcoalSoft, fontWeight: 600, marginBottom: 10 }}>
          This Week's Message
        </div>
        {featured ? (
          <Link
            href={`/c/${params.slug}/notes/${featured.id}`}
            style={{ display: "block", textDecoration: "none", background: palette.forest, borderRadius: 18, padding: "22px 20px", color: palette.onForest, marginBottom: 24 }}
          >
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: palette.goldSoft, marginBottom: 6 }}>
              {featured.series?.name || "General"}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{featured.title}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{featured.speaker} · {featured.date}</div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: palette.goldSoft, fontWeight: 600 }}>
              {completedIds.has(featured.id) ? "Completed — view notes" : "Continue notes →"}
            </div>
          </Link>
        ) : (
          <div style={{ border: `1px dashed ${palette.line}`, borderRadius: 16, padding: "22px 20px", textAlign: "center", marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: palette.charcoalSoft, margin: 0 }}>Nothing published yet — check back Sunday.</p>
          </div>
        )}

        <Link href={`/c/${params.slug}/library`} style={{ display: "block", textAlign: "center", textDecoration: "none", border: `1px solid ${palette.line}`, borderRadius: 999, padding: "10px 0", fontSize: 13, fontWeight: 600, color: palette.charcoal }}>
          Library
        </Link>
      </div>
    </div>
  );
}
