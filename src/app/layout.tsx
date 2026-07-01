import type { Metadata } from "next";

import { QueryProvider } from "@/providers/query-provider";
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
