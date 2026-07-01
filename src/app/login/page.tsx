import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginBrand } from "@/components/auth/login-brand";
import { LogoText } from "@/components/brand/logo-text";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-t from-[#e4e8ee] via-[#f0f3f7] to-[#fafbfd] px-6 dark:from-[#1e1e1e] dark:via-[#262626] dark:to-[#2d2d30]">
      <div className="w-full max-w-sm space-y-10">
        <div className="space-y-5 text-center">
          <LoginBrand />
          <div className="space-y-2">
            <LogoText as="h1" className="text-4xl tracking-wide text-foreground">
              DayFlow
            </LogoText>
            <p className="text-sm text-muted-foreground">
              A calm space for tasks, schedules, and focus.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-[#3a3a3c] dark:bg-[#2d2d30]/90 dark:backdrop-blur-xl">
          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              Sign in failed. Please try again.
            </p>
          ) : null}
          <GoogleSignInButton />
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Continue with Google to access your personal workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
