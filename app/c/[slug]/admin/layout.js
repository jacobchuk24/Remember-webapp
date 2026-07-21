import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { derivePalette } from "@/lib/theme";

export default async function AdminLayout({ children, params }) {
  const supabase = createClient();
  const { data: church } = await supabase.from("churches").select("*").eq("slug", params.slug).maybeSingle();
  if (!church) notFound();
  const palette = derivePalette(church);
    const nav = [
    { href: `/c/${params.slug}/admin`, label: "Sunday Hub" },
    { href: `/c/${params.slug}/admin/create`, label: "Create Message" },
    { href: `/c/${params.slug}/admin/prayers`, label: "Prayer Requests" },
    { href: `/c/${params.slug}/admin/settings`, label: "Settings" },
  ];


  return (
    <div style={{ minHeight: "100vh", background: palette.cream, display: "flex", fontFamily: "'Public Sans', sans-serif" }}>
      <div style={{ width: 200, borderRight: `1px solid ${palette.line}`, padding: "26px 16px" }}>
        <span style={{ fontFamily: "'Parisienne', cursive", fontSize: 24, color: palette.forest }}>Remember</span>
        <div style={{ fontSize: 11, color: palette.charcoalSoft, margin: "6px 0 22px" }}>{church.name}</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map((n) => (
            <a key={n.href} href={n.href} style={{ textDecoration: "none", padding: "9px 12px", borderRadius: 8, color: palette.charcoal, fontSize: 13, fontWeight: 500 }}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
      <div style={{ flex: 1, padding: "30px 40px", maxWidth: 820 }}>{children}</div>
    </div>
  );
}
