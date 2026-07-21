"use client";

import { useState } from "react";
import Link from "next/link";
import { addPrayer, toggleAnswered } from "./actions";

export default function PrayerClient({ palette, slug, initialPrayers }) {
  const [prayers, setPrayers] = useState(initialPrayers);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    setSubmitting(true);
    const optimistic = { id: `temp_${Date.now()}`, text: clean, answered: false, created_at: new Date().toISOString() };
    setPrayers([optimistic, ...prayers]);
    setText("");
    await addPrayer({ slug, text: clean });
    setSubmitting(false);
  };

  const toggle = async (id, current) => {
    setPrayers(prayers.map((p) => (p.id === id ? { ...p, answered: !current } : p)));
    await toggleAnswered({ slug, id, answered: !current });
  };

  const field = { width: "100%", boxSizing: "border-box", border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: palette.charcoal, outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: palette.cream, fontFamily: "'Public Sans', sans-serif", padding: "32px 20px 60px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Link href={`/c/${slug}`} style={{ fontSize: 12, color: palette.forest, textDecoration: "none" }}>← Home</Link>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: palette.forest, margin: "10px 0 4px" }}>Prayer Requests</h1>
        <p style={{ fontSize: 13, color: palette.charcoalSoft, margin: "0 0 22px" }}>What's on your heart this week?</p>

        <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a prayer request…" style={{ ...field, flex: 1 }} />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            style={{ border: "none", cursor: "pointer", background: palette.gold, color: palette.onGold, borderRadius: 10, padding: "0 18px", fontWeight: 700, fontSize: 13, opacity: text.trim() ? 1 : 0.6 }}
          >
            Add
          </button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {prayers.length === 0 && (
            <p style={{ fontSize: 13, color: palette.charcoalSoft, fontStyle: "italic" }}>Nothing recorded yet — add your first prayer above.</p>
          )}
          {prayers.map((p) => (
            <button
              key={p.id}
              onClick={() => toggle(p.id, p.answered)}
              style={{
                textAlign: "left",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
                border: `1px solid ${palette.line}`,
                background: "#fff",
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 13.5, color: palette.charcoal, textDecoration: p.answered ? "line-through" : "none", opacity: p.answered ? 0.6 : 1 }}>
                {p.text}
              </span>
              <span style={{ fontSize: 10.5, color: p.answered ? palette.gold : palette.charcoalSoft, fontWeight: 700, whiteSpace: "nowrap", marginTop: 2 }}>
                {p.answered ? "ANSWERED" : "MARK ANSWERED"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
