"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

/** Toast con il tema attivo (chiaro/scuro) invece di quello di sistema. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      closeButton
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
