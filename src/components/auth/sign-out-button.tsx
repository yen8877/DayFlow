"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  function closeDialog() {
    if (!isLoading) {
      setIsDialogOpen(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-[#ff3b30]"
        onClick={() => setIsDialogOpen(true)}
        disabled={isLoading}
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
      </Button>

      <ConfirmDialog
        open={isDialogOpen}
        message="로그아웃 하시겠습니까?"
        confirmLabel={isLoading ? "Signing out..." : "Sign out"}
        cancelLabel="Cancel"
        isLoading={isLoading}
        onConfirm={handleSignOut}
        onCancel={closeDialog}
      />
    </>
  );
}
