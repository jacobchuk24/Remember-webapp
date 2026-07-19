"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function checkSlugAvailable(slug) {
  const supabase = createClient();
  const { data } = await supabase.from("churches").select("id").eq("slug", slug).maybeSingle();
  return !data;
}

export async function createChurchSignup({ churchName, slug, email }) {
  const cleanSlug = slugify(slug || churchName);
  if (!cleanSlug) throw new Error("Please enter a valid church name.");

  const admin = createAdminClient();

  const { data: existing } = await admin.from("churches").select("id").eq("slug", cleanSlug).maybeSingle();
  if (existing) throw new Error("That URL is already taken — try a different one.");

  const { data: church, error: churchError } = await admin
    .from("churches")
    .insert({ name: churchName, slug: cleanSlug })
    .select()
    .single();
  if (churchError) throw new Error(churchError.message);

  // Queue the admin elevation; the auth callback consumes this once the
  // email is verified via magic link (see app/auth/callback/route.js).
  await admin.from("pending_admin_signups").upsert({ email, church_id: church.id });

  const supabase = createClient();
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/c/${cleanSlug}/admin`,
    },
  });
  if (otpError) throw new Error(otpError.message);

  return { slug: cleanSlug };
}
