import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getUserDashboardPath } from "@/lib/auth/paths";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const publicRoutes = ["/login", "/auth/callback"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function getDashboardUserId(pathname: string) {
  const match = pathname.match(/^\/dashboard\/([^/]+)/);
  return match?.[1] ?? null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    getSupabaseUrl()!,
    getSupabaseAnonKey()!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const dashboardUserId = getDashboardUserId(pathname);

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const userDashboardPath = getUserDashboardPath(user.id);

    if (pathname === "/login" || pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = userDashboardPath;
      return NextResponse.redirect(url);
    }

    if (dashboardUserId && dashboardUserId !== user.id) {
      const url = request.nextUrl.clone();
      url.pathname = userDashboardPath;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
