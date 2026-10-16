"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  authClient,
  useSession,
  type SessionUserWithRole,
} from "@/lib/auth-client";
import { AlertCircle, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const urlReasonError =
    searchParams.get("reason") === "not_admin"
      ? "Accesso negato: il tuo account non possiede privilegi di amministratore (role !== 'admin')."
      : null;
  const displayedError = errorMessage ?? urlReasonError;

  useEffect(() => {
    if (!isSessionLoading && session?.user) {
      const user = session.user as SessionUserWithRole;
      if (user.role === "admin") {
        router.replace("/cars");
      }
    }
  }, [isSessionLoading, session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Inserisci sia l'email che la password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg =
          error.status === 403
            ? "Accesso negato: sono richiesti privilegi di amministratore."
            : error.message || "Credenziali non valide. Riprova.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const loggedUser = data?.user as SessionUserWithRole | undefined;
      if (loggedUser && loggedUser.role && loggedUser.role !== "admin") {
        await authClient.signOut();
        const msg = "Accesso negato: sono richiesti privilegi di amministratore.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      toast.success("Accesso effettuato con successo!");
      router.replace("/cars");
      router.refresh();
    } catch {
      const msg = "Impossibile contattare il server di autenticazione.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100 overflow-hidden">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-2xl shadow-xl shadow-orange-500/20">
            🏎
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-0.5 text-xs font-semibold text-orange-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Better Auth Admin Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Kart-Gram Admin
          </h1>
          <p className="text-sm text-zinc-400">
            Accedi con le credenziali amministratore per gestire il catalogo di
            gioco
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {displayedError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{displayedError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Email Amministratore
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="admin@kartgram.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pr-4 pl-10 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pr-4 pl-10 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-orange-500/20 hover:from-orange-400 hover:to-amber-400 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Autenticazione in corso...
                </>
              ) : (
                "Accedi alla Dashboard"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center text-xs text-zinc-400">
            Non hai ancora un account?{" "}
            <Link
              href="/register"
              className="font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-4"
            >
              Registrati
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
