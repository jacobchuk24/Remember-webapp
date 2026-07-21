"use client";

import { useState } from "react";
import { adminToggleAnswered } from "./actions";

export default function PrayersClient({ palette, slug, initialPrayers }) {
  const [prayers, setPrayers] = useState(initialPrayers);

  const toggle = async (id, current) => {
    setPrayers(prayers.map((p) => (p.id === id ? { ...p, answered: !current } : p)));
    await adminToggleAnswered({ slug, id, answered: !current });
  };

  const unanswered = prayers.filter((p) => !p.answered);
  const answered = prayers.filter((p) => p.answered);

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: palette.forest, margin: "0 0 4px" }}>Prayer Requests</h1>
      <p style={{ fontSize: 13, color: palette.charcoalSoft, margin: "0 0 22px" }}>Everything your congregation has submitted.</p>

      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <div style={{ border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 12, padding: 16, flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: palette.forest }}>{unanswered.length}</div>
          <div style={{ fontSize: 11.5, color: palette.charcoalSoft }}>Awaiting</div>
        </div>
        <div style={{ border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 12, padding: 16, flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: palette.forest }}>{answered.length}</div>
          <div style={{ fontSize: 11.5, color: palette.charcoalSoft }}>Answered</div>
        </div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: palette.charcoalSoft, fontWeight: 600, marginBottom: 10 }}>All Requests</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {prayers.length === 0 && <p style={{ fontSize: 13, color: palette.charcoalSoft, fontStyle: "italic" }}>Nothing submitted yet.</p>}
        {prayers.map((p) => (
          <button
            key={p.id}
            onClick={() => toggle(p.id, p.answered)}
            style={{
              textAlign: "left",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              padding: "13px 16px",
              border: `1px solid ${palette.line}`,
              background: "#fff",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, color: palette.charcoal, textDecoration: p.answered ? "line-through" : "none", opacity: p.answered ? 0.6 : 1 }}>{p.text}</div>
              <div style={{ fontSize: 11, color: palette.charcoalSoft, marginTop: 4 }}>{p.memberName} · {new Date(p.created_at).toLocaleDateString()}</div>
            </div>
            <span style={{ fontSize: 10.5, color: p.answered ? palette.gold : palette.charcoalSoft, fontWeight: 700, whiteSpace: "nowrap", marginTop: 2 }}>
              {p.answered ? "ANSWERED" : "MARK ANSWERED"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
