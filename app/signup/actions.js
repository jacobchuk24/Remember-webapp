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

export async function createChurchSignup({ churchName, slug, email, password }) {
  const cleanSlug = slugify(slug || churchName);
  if (!cleanSlug) throw new Error("Please enter a valid church name.");
  if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");

  const admin = createAdminClient();

  const { data: existing } = await admin.from("churches").select("id").eq("slug", cleanSlug).maybeSingle();
  if (existing) throw new Error("That URL is already taken — try a different one.");

  const { data: church, error: churchError } = await admin
    .from("churches")
    .insert({ name: churchName, slug: cleanSlug })
    .select()
    .single();
  if (churchError) throw new Error(churchError.message);

  await admin.from("pending_admin_signups").upsert({ email, church_id: church.id });

  const supabase = createClient();
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/c/${cleanSlug}/admin`,
    },
  });
  if (signUpError) throw new Error(signUpError.message);

  return { slug: cleanSlug };
}
