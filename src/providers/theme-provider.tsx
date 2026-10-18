"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Tema chiaro/scuro: classe "dark" su <html>, segue il sistema finché l'utente non sceglie, scelta salvata in localStorage. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="kartgram-theme">
      {children}
    </NextThemesProvider>
  );
}
