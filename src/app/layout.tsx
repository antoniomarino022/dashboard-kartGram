import { Suspense } from "react";
import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemedToaster } from "@/providers/themed-toaster";
import "./globals.css";

export const instant = false;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// stesso font dei titoli del gioco
const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-barlow" });

export const metadata: Metadata = {
  title: { default: "Panoramica · KartGram", template: "%s · KartGram" },
  description:
    "Dashboard amministrativa di Kart-Gram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning className={`${inter.variable} ${barlow.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-tg-chat text-tg-primary">
        <ThemeProvider>
          <QueryProvider>
            <Suspense fallback={<div className="h-screen w-screen bg-tg-chat" />}>
              <DashboardShell>{children}</DashboardShell>
            </Suspense>
          </QueryProvider>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
