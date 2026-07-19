"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NotesEditor({ palette, sermon, slug, initialAnswers, alreadyCompleted }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [saved, setSaved] = useState(true);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  const update = (blockId, value) => {
    const next = { ...answers, [blockId]: value };
    setAnswers(next);
    setSaved(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("sermon_notes").upsert(
        { user_id: user.id, sermon_id: sermon.id, answers: next, updated_at: new Date().toISOString() },
        { onConflict: "user_id,sermon_id" }
      );
      setSaved(true);
    }, 600);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const markComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("completions").upsert(
      { user_id: user.id, sermon_id: sermon.id, completed_at: new Date().toISOString() },
      { onConflict: "user_id,sermon_id" }
    );
    const prayerTexts = sermon.blocks.filter((b) => b.type === "prayer").map((b) => answers[b.id]).filter((t) => t && t.trim());
    for (const text of prayerTexts) {
      await supabase.from("prayers").insert({ user_id: user.id, text: text.trim() });
    }
    setDone(true);
    setTimeout(() => router.push(`/c/${slug}`), 1800);
  };

  const field = { width: "100%", boxSizing: "border-box", border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: palette.charcoal, outline: "none" };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: palette.forest, color: palette.onForest, textAlign: "center", padding: "0 32px", fontFamily: "'Public Sans', sans-serif" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic" }}>This message has been added to your journey.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: palette.cream, fontFamily: "'Public Sans', sans-serif", padding: "32px 20px 100px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Link href={`/c/${slug}`} style={{ fontSize: 12, color: palette.forest, textDecoration: "none" }}>← Home</Link>
        <div style={{ fontSize: 11, textTransform: "uppercase", color: palette.charcoalSoft, marginTop: 14 }}>{sermon.series?.name || "General"}</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: palette.forest, margin: "2px 0 4px" }}>{sermon.title}</h1>
        <div style={{ fontSize: 12, color: palette.charcoalSoft, marginBottom: 24 }}>{sermon.speaker} · {sermon.date}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {sermon.blocks.map((b) => {
            if (b.type === "text") return <p key={b.id} style={{ fontSize: 13.5, color: palette.charcoal, lineHeight: 1.6, margin: 0 }}>{b.content}</p>;
            if (b.type === "announcement") return <div key={b.id} style={{ background: "#fff", border: `1px solid ${palette.line}`, borderRadius: 12, padding: "12px 14px", fontSize: 13 }}>{b.content}</div>;
            if (b.type === "youtube" || b.type === "facebook") {
              return (
                <a key={b.id} href={b.content} target="_blank" rel="noreferrer" style={{ display: "block", background: "#fff", border: `1px solid ${palette.line}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, fontWeight: 600, color: palette.charcoal, textDecoration: "none" }}>
                  Watch on {b.type === "youtube" ? "YouTube" : "Facebook"} ↗
                </a>
              );
            }
            if (b.type === "image") return <div key={b.id} style={{ background: "#fff", border: `1px solid ${palette.line}`, borderRadius: 12, padding: "18px 14px", textAlign: "center", fontSize: 11.5, color: palette.charcoalSoft }}>{b.content}</div>;
            return (
              <div key={b.id}>
                <p style={{ fontSize: 13.5, color: palette.charcoal, marginBottom: 8, lineHeight: 1.5 }}>{b.content}</p>
                {b.type === "blank" ? (
                  <input value={answers[b.id] || ""} onChange={(e) => update(b.id, e.target.value)} placeholder="Type your answer…" style={field} />
                ) : (
                  <textarea value={answers[b.id] || ""} onChange={(e) => update(b.id, e.target.value)} rows={3} placeholder={b.type === "prayer" ? "Lord, I pray…" : "Write your thoughts…"} style={{ ...field, resize: "none" }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 11, color: palette.charcoalSoft, height: 16, marginTop: 10 }}>{saved ? "Saved" : "Saving…"}</div>

        <button
          onClick={markComplete}
          style={{ marginTop: 16, width: "100%", padding: "14px 0", borderRadius: 999, border: "none", cursor: "pointer", background: palette.gold, color: palette.onGold, fontWeight: 700, fontSize: 14 }}
        >
          {alreadyCompleted ? "Update & Re-mark Complete" : "Mark Complete"}
        </button>
      </div>
    </div>
  );
}
