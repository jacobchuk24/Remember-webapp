"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSeries, saveSermon } from "./actions";

const BLOCK_TYPES = [
  { type: "text", label: "Text", placeholder: "Write a paragraph of sermon content…" },
  { type: "blank", label: "Fill in the Blank", placeholder: "Faith is not the absence of ______, but…" },
  { type: "reflection", label: "Reflection Question", placeholder: "Where in your life…" },
  { type: "prayer", label: "Prayer Prompt", placeholder: "Write a prayer asking God for…" },
  { type: "image", label: "Image", placeholder: "Image URL or description…" },
  { type: "youtube", label: "YouTube Link", placeholder: "https://youtube.com/…" },
  { type: "facebook", label: "Facebook Link", placeholder: "https://facebook.com/…" },
  { type: "announcement", label: "Announcement", placeholder: "Vacation Bible School signups open…" },
];

export default function SermonForm({ palette, churchId, slug, seriesList: initialSeries }) {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState(initialSeries);
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [date, setDate] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [publishedFlash, setPublishedFlash] = useState(false);
  const [saving, setSaving] = useState(false);

  const field = { width: "100%", boxSizing: "border-box", border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: palette.charcoal, outline: "none" };

  const addBlock = (type) => setBlocks([...blocks, { id: `blk_${Date.now()}`, type, content: "" }]);
  const updateBlock = (id, content) => setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  const removeBlock = (id) => setBlocks(blocks.filter((b) => b.id !== id));
  const moveBlock = (id, dir) => {
    const idx = blocks.findIndex((b) => b.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setBlocks(next);
  };

  const confirmNewSeries = async () => {
    const name = newSeriesName.trim();
    if (!name) return;
    const created = await createSeries(churchId, name);
    setSeriesList([...seriesList, created]);
    setSeriesId(created.id);
    setNewSeriesName("");
    setShowNewSeries(false);
  };

  const canSave = title.trim() && speaker.trim() && date && seriesId;

  const submit = async (status) => {
    if (!canSave) return;
    setSaving(true);
    await saveSermon({ churchId, slug, seriesId, title, speaker, date, description, blocks, status });
    setSaving(false);
    if (status === "published") {
      setPublishedFlash(true);
      setTimeout(() => router.push(`/c/${slug}/admin`), 1500);
    } else {
      router.push(`/c/${slug}/admin`);
    }
  };

  if (publishedFlash) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", color: palette.forest }}>Publish. Done.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: palette.forest, margin: "0 0 20px" }}>Create Message</h1>

      <div style={{ background: "#fff", border: `1px solid ${palette.line}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={labelStyle(palette)}>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} style={field} /></div>
          <div><label style={labelStyle(palette)}>Speaker</label><input value={speaker} onChange={(e) => setSpeaker(e.target.value)} style={field} /></div>
          <div><label style={labelStyle(palette)}>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={field} /></div>
          <div>
            <label style={labelStyle(palette)}>Series</label>
            {showNewSeries ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input autoFocus value={newSeriesName} onChange={(e) => setNewSeriesName(e.target.value)} style={field} />
                <button type="button" onClick={confirmNewSeries} style={ghostBtn(palette)}>Add</button>
              </div>
            ) : (
              <select value={seriesId} onChange={(e) => (e.target.value === "__new" ? setShowNewSeries(true) : setSeriesId(e.target.value))} style={field}>
                <option value="">Select a series…</option>
                {seriesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                <option value="__new">+ Create new series</option>
              </select>
            )}
          </div>
        </div>
        <label style={labelStyle(palette)}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...field, resize: "none" }} />
      </div>

      <label style={labelStyle(palette)}>Content Blocks</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {blocks.map((b) => {
          const meta = BLOCK_TYPES.find((t) => t.type === b.type);
          return (
            <div key={b.id} style={{ border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11.5, fontWeight: 700, color: palette.forest, textTransform: "uppercase" }}>
                <span>{meta.label}</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => moveBlock(b.id, -1)} style={iconBtn(palette)}>↑</button>
                  <button type="button" onClick={() => moveBlock(b.id, 1)} style={iconBtn(palette)}>↓</button>
                  <button type="button" onClick={() => removeBlock(b.id)} style={iconBtn(palette)}>✕</button>
                </span>
              </div>
              <textarea value={b.content} onChange={(e) => updateBlock(b.id, e.target.value)} placeholder={meta.placeholder} rows={2} style={{ ...field, resize: "none" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {BLOCK_TYPES.map((t) => (
          <button key={t.type} type="button" onClick={() => addBlock(t.type)} style={{ border: `1px dashed ${palette.line}`, background: "none", cursor: "pointer", borderRadius: 999, padding: "7px 12px", fontSize: 12, color: palette.charcoalSoft }}>
            + {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" disabled={!canSave || saving} onClick={() => submit("published")} style={{ border: "none", cursor: canSave ? "pointer" : "default", opacity: canSave ? 1 : 0.5, background: palette.forest, color: palette.onForest, borderRadius: 999, padding: "11px 20px", fontWeight: 600, fontSize: 13.5 }}>
          Publish
        </button>
        <button type="button" disabled={saving} onClick={() => submit("draft")} style={ghostBtn(palette)}>Save Draft</button>
      </div>
    </div>
  );
}

function labelStyle(palette) {
  return { display: "block", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: palette.charcoalSoft, fontWeight: 600, marginBottom: 6 };
}
function ghostBtn(palette) {
  return { border: `1px solid ${palette.line}`, background: "#fff", cursor: "pointer", color: palette.charcoal, borderRadius: 999, padding: "9px 16px", fontWeight: 600, fontSize: 12.5 };
}
function iconBtn(palette) {
  return { border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 6, width: 22, height: 22, cursor: "pointer", color: palette.charcoalSoft, fontSize: 11 };
}
