import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Registrazione Admin | Kart-Gram Dashboard",
  description: "Registrazione nuovo account amministratore per Kart-Gram.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
          Caricamento modulo di registrazione...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
