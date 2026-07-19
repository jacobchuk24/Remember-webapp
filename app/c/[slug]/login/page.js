"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChurchLoginPage({ params }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const router = useRouter();

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin, church_id").eq("id", data.user.id).maybeSingle();
    const { data: church } = await supabase.from("churches").select("id").eq("slug", params.slug).maybeSingle();
    setLoading(false);

    if (!profile || !church || profile.church_id !== church.id) {
      router.push(`/c/${params.slug}`);
      return;
    }
    router.push(profile.is_admin ? `/c/${params.slug}/admin` : `/c/${params.slug}`);
  };

  const signup = async (e) => {
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
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/c/${params.slug}` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSignedUp(true);
  };

  const field = { border: "1px solid #E5DDC8", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F1E6", fontFamily: "'Public Sans', sans-serif", padding: 20 }}>
      <div style={{ width: 340 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 32, color: "#1B3A2F" }}>Remember</span>
          <p style={{ fontSize: 13, color: "#6B6355", marginTop: 4 }}>
            {mode === "login" ? "Sign in to your church's Remember." : "Create your account."}
          </p>
        </div>

        <div style={{ display: "flex", background: "#fff", border: "1px solid #E5DDC8", borderRadius: 999, padding: 4, marginBottom: 20 }}>
          <button
            onClick={() => { setMode("login"); setError(""); }}
            style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 999, padding: "8px 0", fontSize: 13, fontWeight: 600, background: mode === "login" ? "#1B3A2F" : "transparent", color: mode === "login" ? "#F6F1E6" : "#6B6355" }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 999, padding: "8px 0", fontSize: 13, fontWeight: 600, background: mode === "signup" ? "#1B3A2F" : "transparent", color: mode === "signup" ? "#F6F1E6" : "#6B6355" }}
          >
            Sign Up
          </button>
        </div>

        {signedUp ? (
          <p style={{ fontSize: 14, color: "#3A342B", textAlign: "center" }}>
            Check your inbox to confirm your email — after that you can log in with your password anytime.
          </p>
        ) : (
          <form onSubmit={mode === "login" ? login : signup} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={field} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={field} />
            {mode === "signup" && (
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" style={field} />
            )}
            <button type="submit" disabled={loading} style={{ border: "none", cursor: "pointer", background: "#1B3A2F", color: "#F6F1E6", borderRadius: 999, padding: "11px 0", fontWeight: 600, fontSize: 14, opacity: loading ? 0.6 : 1 }}>
              {loading ? "…" : mode === "login" ? "Log In" : "Create Account"}
            </button>
            {error && <p style={{ color: "#B4453A", fontSize: 12.5 }}>{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
