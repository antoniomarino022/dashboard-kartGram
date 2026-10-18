import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Login Admin | Kart-Gram Dashboard",
  description: "Accesso riservato agli amministratori di Kart-Gram.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
          Caricamento modulo di accesso...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
