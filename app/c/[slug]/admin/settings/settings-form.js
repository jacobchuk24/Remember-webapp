"use client";

import { useState } from "react";
import { derivePalette } from "@/lib/theme";
import { updateChurchBranding } from "./actions";

export default function SettingsForm({ palette, church, slug }) {
  const [name, setName] = useState(church.name);
  const [primaryColor, setPrimaryColor] = useState(church.primary_color);
  const [accentColor, setAccentColor] = useState(church.accent_color);
  const [backgroundColor, setBackgroundColor] = useState(church.background_color);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const dirty =
    name !== church.name ||
    primaryColor !== church.primary_color ||
    accentColor !== church.accent_color ||
    backgroundColor !== church.background_color;

  const previewPalette = derivePalette({ primary_color: primaryColor, accent_color: accentColor, background_color: backgroundColor });

  const save = async () => {
    setSaving(true);
    await updateChurchBranding({ churchId: church.id, slug, name, primaryColor, accentColor, backgroundColor });
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const field = { width: "100%", boxSizing: "border-box", border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: palette.charcoal, outline: "none" };
  const label = { display: "block", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: palette.charcoalSoft, fontWeight: 600, marginBottom: 6 };

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: palette.forest, margin: "0 0 4px" }}>Settings</h1>
      <p style={{ fontSize: 13, color: palette.charcoalSoft, margin: "0 0 22px" }}>Branding here applies everywhere, for every member.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={{ background: "#fff", border: `1px solid ${palette.line}`, borderRadius: 14, padding: 18 }}>
          <label style={label}>Church Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...field, marginBottom: 18 }} />

          <label style={label}>Brand Colors</label>
          {[
            { key: "primary", value: primaryColor, set: setPrimaryColor, label: "Primary" },
            { key: "accent", value: accentColor, set: setAccentColor, label: "Accent" },
            { key: "background", value: backgroundColor, set: setBackgroundColor, label: "Background" },
          ].map((f) => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: palette.charcoal }}>{f.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11.5, color: palette.charcoalSoft }}>{f.value}</span>
                <input
                  type="color"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  style={{ width: 32, height: 32, border: `1px solid ${palette.line}`, borderRadius: 8, padding: 0, cursor: "pointer", background: "none" }}
                />
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={save}
              disabled={!dirty || saving}
              style={{ border: "none", cursor: dirty ? "pointer" : "default", opacity: dirty ? 1 : 0.5, background: palette.forest, color: palette.onForest, borderRadius: 999, padding: "11px 20px", fontWeight: 600, fontSize: 13.5 }}
            >
              {savedFlash ? "Saved" : saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: `1px solid ${palette.line}`, borderRadius: 14, padding: 18 }}>
          <label style={label}>Preview</label>
          <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${previewPalette.line}` }}>
            <div style={{ background: previewPalette.cream, padding: 16 }}>
              <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 20, color: previewPalette.forest }}>{name || "Your Church"}</span>
              <div style={{ marginTop: 12, background: previewPalette.forest, color: previewPalette.onForest, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: previewPalette.goldSoft, marginBottom: 4 }}>Preview</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600 }}>This is how your brand looks</div>
              </div>
              <button style={{ marginTop: 12, border: "none", background: previewPalette.gold, color: previewPalette.onGold, borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 700 }}>
                Sample Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
