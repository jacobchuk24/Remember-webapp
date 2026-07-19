"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChurchLoginPage({ params }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const sendLink = async (e) => {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/c/${params.slug}` },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F1E6", fontFamily: "'Public Sans', sans-serif" }}>
      <div style={{ width: 340, textAlign: "center" }}>
        <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 32, color: "#1B3A2F" }}>Remember</span>
        <p style={{ fontSize: 13, color: "#6B6355", marginTop: 4, marginBottom: 28 }}>
          Sign in to your church's Remember.
        </p>
        {sent ? (
          <p style={{ fontSize: 14, color: "#3A342B" }}>Check your inbox for a link to sign in.</p>
        ) : (
          <form onSubmit={sendLink} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ border: "1px solid #E5DDC8", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none" }}
            />
            <button type="submit" style={{ border: "none", cursor: "pointer", background: "#1B3A2F", color: "#F6F1E6", borderRadius: 999, padding: "11px 0", fontWeight: 600, fontSize: 14 }}>
              Send sign-in link
            </button>
            {error && <p style={{ color: "#B4453A", fontSize: 12.5 }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
