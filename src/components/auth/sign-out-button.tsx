"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
      onClick={handleSignOut}
      disabled={isLoading}
    >
      <LogOut className="size-4" />
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
