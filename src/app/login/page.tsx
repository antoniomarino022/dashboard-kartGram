import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Accedi",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-tg-chat text-sm text-tg-muted">
          Caricamento…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
