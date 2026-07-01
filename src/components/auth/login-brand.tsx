import { DayFlowLogo } from "@/components/brand/dayflow-logo";
import { cn } from "@/lib/utils";

interface LoginBrandProps {
  className?: string;
}

export function LoginBrand({ className }: LoginBrandProps) {
  return (
    <div
      role="img"
      aria-label="DayFlow logo"
      className={cn("mx-auto flex justify-center", className)}
    >
      <DayFlowLogo className="h-40 w-auto" />
    </div>
  );
}
