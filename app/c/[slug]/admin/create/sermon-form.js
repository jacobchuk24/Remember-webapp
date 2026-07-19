"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSeries, saveSermon } from "../create/actions";

const BLOCK_TYPES = [
  { type: "text", label: "Text", placeholder: "Write a paragraph of sermon content…" },
  { type: "blank", label: "Fill in the Blank", placeholder: "Faith is not the absence of ______, but…" },
  { type: "reflection", label: "Reflection Question", placeholder: "Where in your life…" },
  { type: "prayer", label: "Prayer Prompt", placeholder: "Write a prayer asking God for…" },
  { type: "image", label: "Image (shows at top)", placeholder: "Image URL or description…" },
  { type: "youtube", label: "YouTube Link", placeholder: "https://youtube.com/…" },
  { type: "facebook", label: "Facebook Link", placeholder: "https://facebook.com/…" },
  { type: "announcement", label: "Announcement (shows at bottom)", placeholder: "Vacation Bible School signups open…" },
];

const IMAGE_CAPABLE_TYPES = ["image", "announcement"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SermonForm({ palette, churchId, slug, seriesList: initialSeries, existingSermon }) {
  const router = useRouter();
  const isEditing = !!existingSermon;

  const [seriesList, setSeriesList] = useState(initialSeries);
  const [title, setTitle] = useState(existingSermon?.title || "");
  const [speaker, setSpeaker] = useState(existingSermon?.speaker || "");
  const [date, setDate] = useState(existingSermon?.date || "");
  const [seriesId, setSeriesId] = useState(existingSermon?.series_id || "");
  const [description, setDescription] = useState(existingSermon?.description || "");
  const [blocks, setBlocks] = useState(existingSermon?.blocks || []);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [publishedFlash, setPublishedFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

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

  const handleImagePick = async (blockId, file) => {
    if (!file) return;
    setUploadingId(blockId);
    try {
      const dataUrl = await fileToDataUrl(file);
      updateBlock(blockId, dataUrl);
    } finally {
      setUploadingId(null);
    }
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
    await saveSermon({ id: existingSermon?.id, churchId, slug, seriesId, title, speaker, date, description, blocks, status });
    setSaving(false);
    setPublishedFlash(true);
    setTimeout(() => router.push(`/c/${slug}/admin`), 1400);
  };

  if (publishedFlash) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", color: palette.forest }}>
          {isEditing ? "Saved." : "Publish. Done."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: palette.forest, margin: "0 0 20px" }}>
        {isEditing ? "Edit Message" : "Create Message"}
      </h1>

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
          const isImageCapable = IMAGE_CAPABLE_TYPES.includes(b.type);
          const hasImage = b.content && b.content.startsWith("data:");
          return (
            <div key={b.id} style={{ border: `1px solid ${palette.line}`, background: "#fff", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11.5, fontWeight: 700, color: palette.forest, textTransform: "uppercase" }}>
                <span>{meta.label}</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => moveBlock(b.id, -1)} style={iconBtn(palette)}>↑</button>
                  <button type="button" onClick={() => moveBlock(b.id, 1)} style={iconBtn(palette)}>↓</button>
                  <button type="button" onClick={() => removeBlock(b.id)} style={iconBtn(palette)}>✕</button>
                </span>
              </div>

              {isImageCapable ? (
                <div>
                  {hasImage && (
                    <img src={b.content} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, marginBottom: 8, display: "block" }} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagePick(b.id, e.target.files?.[0])}
                    style={{ fontSize: 12.5, color: palette.charcoalSoft, width: "100%" }}
                  />
                  {uploadingId === b.id && <div style={{ fontSize: 11.5, color: palette.charcoalSoft, marginTop: 4 }}>Loading image…</div>}
                  <div style={{ fontSize: 11, color: palette.charcoalSoft, margin: "6px 0 4px" }}>
                    {b.type === "announcement" ? "Or type an announcement instead:" : "Or paste an image URL instead:"}
                  </div>
                  {b.type === "announcement" ? (
                    <textarea
                      value={hasImage ? "" : b.content}
                      onChange={(e) => updateBlock(b.id, e.target.value)}
                      placeholder={meta.placeholder}
                      rows={2}
                      style={{ ...field, resize: "none" }}
                    />
                  ) : (
                    <input
                      value={hasImage ? "" : b.content}
                      onChange={(e) => updateBlock(b.id, e.target.value)}
                      placeholder="https://…"
                      style={field}
                    />
                  )}
                </div>
              ) : (
                <textarea value={b.content} onChange={(e) => updateBlock(b.id, e.target.value)} placeholder={meta.placeholder} rows={2} style={{ ...field, resize: "none" }} />
              )}
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
          {isEditing ? "Save & Publish" : "Publish"}
        </button>
        <button type="button" disabled={!canSave || saving} onClick={() => submit("draft")} style={ghostBtn(palette)}>
          {isEditing ? "Save as Draft" : "Save Draft"}
        </button>
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
