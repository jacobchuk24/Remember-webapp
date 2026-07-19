import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const adminMatch = request.nextUrl.pathname.match(/^\/c\/([^/]+)\/admin/);
  if (adminMatch) {
    const slug = adminMatch[1];
    if (!user) {
      return NextResponse.redirect(new URL(`/c/${slug}/login?next=/c/${slug}/admin`, request.url));
    }
    const { data: church } = await supabase.from("churches").select("id").eq("slug", slug).maybeSingle();
    const { data: profile } = await supabase.from("profiles").select("is_admin, church_id").eq("id", user.id).maybeSingle();

    if (!church || !profile?.is_admin || profile.church_id !== church.id) {
      return NextResponse.redirect(new URL(`/c/${slug}`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/c/:slug/admin/:path*"],
};
