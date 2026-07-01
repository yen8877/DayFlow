import { redirect } from "next/navigation";

import { Dashboard } from "@/components/dashboard";
import { getUserDashboardPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id !== userId) {
    redirect(getUserDashboardPath(user.id));
  }

  return <Dashboard />;
}
