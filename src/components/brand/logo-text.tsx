import { cn } from "@/lib/utils";
import { logoFont } from "@/lib/fonts/logo-font";

interface LogoTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "span" | "p";
}

export function LogoText({
  children,
  className,
  as: Component = "span",
}: LogoTextProps) {
  return (
    <Component className={cn(logoFont.className, className)}>
      {children}
    </Component>
  );
}
