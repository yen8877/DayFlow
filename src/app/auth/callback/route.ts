import { NextResponse } from "next/server";

import { getUserDashboardPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const destination = user ? getUserDashboardPath(user.id) : "/login";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
