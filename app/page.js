"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [slug, setSlug] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const goToChurch = (e) => {
    e.preventDefault();
    const clean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (clean) router.push(`/c/${clean}`);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  const field = { border: "1px solid #E5DDC8", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };

  if (recovering) {
    return (
      <div style={{ minHeight: "100vh", background: "#F6F1E6", fontFamily: "'Public Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: 340, textAlign: "center" }}>
          <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 32, color: "#1B3A2F" }}>Remember</span>
          <p style={{ fontSize: 13, color: "#6B6355", margin: "4px 0 24px" }}>Set a new password.</p>

          {done ? (
            <p style={{ fontSize: 14, color: "#3A342B" }}>Your password is set — you can now log in with it anytime.</p>
          ) : (
            <form onSubmit={updatePassword} style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" style={field} />
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={field} />
              <button type="submit" disabled={loading} style={{ border: "none", cursor: "pointer", background: "#1B3A2F", color: "#F6F1E6", borderRadius: 999, padding: "11px 0", fontWeight: 600, fontSize: 14, opacity: loading ? 0.6 : 1 }}>
                {loading ? "…" : "Set Password"}
              </button>
              {error && <p style={{ color: "#B4453A", fontSize: 12.5 }}>{error}</p>}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F1E6", fontFamily: "'Public Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 400, textAlign: "center" }}>
        <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 40, color: "#1B3A2F" }}>Remember</span>
        <p style={{ fontSize: 15, color: "#3A342B", fontStyle: "italic", margin: "10px 0 36px" }}>
          Turn every sermon into a lifelong record of spiritual growth.
        </p>

        <div style={{ background: "#fff", border: "1px solid #E5DDC8", borderRadius: 16, padding: 22, marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#6B6355", fontWeight: 600, marginBottom: 10 }}>I'm a member</div>
          <form onSubmit={goToChurch} style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", border: "1px solid #E5DDC8", borderRadius: 10, padding: "0 10px" }}>
              <span style={{ fontSize: 13, color: "#6B6355" }}>/c/</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-church" style={{ border: "none", outline: "none", padding: "10px 4px", fontSize: 13.5, flex: 1 }} />
            </div>
            <button type="submit" style={{ border: "none", cursor: "pointer", background: "#1B3A2F", color: "#F6F1E6", borderRadius: 10, padding: "0 18px", fontWeight: 600, fontSize: 13 }}>Go</button>
          </form>
          <p style={{ fontSize: 11.5, color: "#6B6355", marginTop: 8 }}>Ask your church for their Remember link if you're not sure.</p>
        </div>

        <div style={{ background: "#1B3A2F", borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#DCC28A", fontWeight: 600, marginBottom: 8 }}>I'm a church</div>
          <p style={{ fontSize: 13, color: "#F6F1E6", opacity: 0.85, marginBottom: 14 }}>Disciple your congregation before, during, and after the sermon.</p>
          <a href="/signup" style={{ display: "inline-block", textDecoration: "none", background: "#C6A15B", color: "#1B3A2F", borderRadius: 999, padding: "10px 22px", fontWeight: 700, fontSize: 13 }}>
            Start free 30-day trial
          </a>
        </div>
      </div>
    </div>
  );
}
