"use client";

import { useState } from "react";
import { createChurchSignup } from "./actions";

export default function SignupPage() {
  const [churchName, setChurchName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const autoSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const onNameChange = (v) => {
    setChurchName(v);
    if (!slugEdited) setSlug(autoSlug(v));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await createChurchSignup({ churchName, slug, email, password });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F1E6", fontFamily: "'Public Sans', sans-serif", padding: 20 }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 30, color: "#1B3A2F" }}>Remember</span>
          <p style={{ fontSize: 13, color: "#6B6355", marginTop: 4 }}>Start your church's free 30-day trial.</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#3A342B" }}>
              Check your inbox — click the link to confirm your email and finish setting up <strong>{churchName}</strong>.
              After that, log in anytime with your email and password.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={labelStyle}>Church Name</label>
              <input required value={churchName} onChange={(e) => onNameChange(e.target.value)} placeholder="Grace & Table Church" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Your App URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                <span style={{ color: "#6B6355" }}>remember.app/c/</span>
                <input required value={slug} onChange={(e) => { setSlug(autoSlug(e.target.value)); setSlugEdited(true); }} style={{ ...fieldStyle, flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Your Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pastor@church.org" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={fieldStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ border: "none", cursor: "pointer", background: "#1B3A2F", color: "#F6F1E6", borderRadius: 999, padding: "12px 0", fontWeight: 600, fontSize: 14, marginTop: 8, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Creating…" : "Create Church"}
            </button>
            {error && <p style={{ color: "#B4453A", fontSize: 12.5 }}>{error}</p>}
            <p style={{ fontSize: 11.5, color: "#6B6355", textAlign: "center", marginTop: 4 }}>No credit card required. We'll never charge your congregation.</p>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6B6355", fontWeight: 600, marginBottom: 6 };
const fieldStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #E5DDC8", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" };
