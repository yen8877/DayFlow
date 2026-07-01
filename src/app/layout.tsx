import type { Metadata } from "next";
import Script from "next/script";

import { QueryProvider } from "@/providers/query-provider";
import { CalendarFilterProvider } from "@/providers/calendar-filter-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "DayFlow",
  description:
    "Execution-focused productivity platform for task management, scheduling, and time blocking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-x-hidden antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Script id="dayflow-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("dayflow-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`}
        </Script>
        <ThemeProvider>
          <QueryProvider>
            <CalendarFilterProvider>{children}</CalendarFilterProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
