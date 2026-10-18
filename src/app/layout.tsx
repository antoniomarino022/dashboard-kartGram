import { Suspense } from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const instant = false;

export const metadata: Metadata = {
  title: "Kart-Gram | Telegram Web Admin",
  description:
    "Dashboard Amministrativa per la gestione del catalogo di gioco di Kart-Gram (Auto, Personaggi, Mappe, Vernici, Ruote, Powerup).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning className="dark h-full antialiased">
      <body className="h-full overflow-hidden bg-tg-chat text-tg-primary">
        <QueryProvider>
          <Suspense fallback={<div className="h-screen w-screen bg-tg-chat" />}>
            <DashboardShell>{children}</DashboardShell>
          </Suspense>
        </QueryProvider>
        <Toaster position="bottom-left" closeButton />
      </body>
    </html>
  );
}
