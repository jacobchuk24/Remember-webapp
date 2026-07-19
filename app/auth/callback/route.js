import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) return NextResponse.redirect(`${origin}/`);

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/`);

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existingProfile) {
    // IMPORTANT: we never trust "make me an admin" from the URL — a user
    // fully controls the query string of a link they clicked in their own
    // inbox. Instead, admin elevation is only granted if a matching row
    // exists in pending_admin_signups, which only the service-role signup
    // action (app/signup/actions.js) can write, keyed by this exact,
    // now-verified email address.
    const admin = createAdminClient();
    const { data: pending } = await admin
      .from("pending_admin_signups")
      .select("church_id")
      .eq("email", data.user.email)
      .maybeSingle();

    if (pending) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        church_id: pending.church_id,
        is_admin: true,
        display_name: data.user.email,
      });
      await admin.from("pending_admin_signups").delete().eq("email", data.user.email);
    } else {
      // Regular member: join whichever church's link they signed in from.
      // Worst case here is joining as a plain (non-admin) member of the
      // wrong church, which carries no privilege risk.
      const slugMatch = next.match(/^\/c\/([^/]+)/);
      const slug = slugMatch?.[1];
      const church = slug
        ? (await supabase.from("churches").select("id").eq("slug", slug).maybeSingle()).data
        : null;
      if (church) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          church_id: church.id,
          is_admin: false,
          display_name: data.user.email,
        });
      }
      // If there's no church context at all, we leave them profile-less;
      // they'll land on `/` and can search for their church there.
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
