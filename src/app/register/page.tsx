import type { Metadata } from "next";
import Link from "next/link";
import { CarFront } from "lucide-react";
import { TrackBackdrop } from "@/components/layout/track-backdrop";

export const metadata: Metadata = {
  title: "Registrazione",
};

// registrazione disattivata lato server (disableSignUp): la pagina resta solo come avviso
export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-tg-chat px-4 py-12 text-tg-primary">
      <TrackBackdrop />
      <div className="relative w-full max-w-sm rounded-2xl border border-tg-border bg-tg-surface/95 p-8 text-center shadow-elevated backdrop-blur-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-tg-accent text-tg-on-accent">
          <CarFront className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-wide">
          KartGram
        </h1>
        <p className="mt-4 text-[15px] text-tg-muted">Registrazione disattivata</p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-tg-accent text-sm font-semibold text-tg-on-accent transition-colors hover:bg-tg-accent-hover"
        >
          Accedi
        </Link>
      </div>
    </div>
  );
}
