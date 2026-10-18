"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CarFront } from "lucide-react";
import {
  authClient,
  useSession,
  type SessionUserWithRole,
} from "@/lib/auth-client";
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
      ? "Accesso negato: account privo di ruolo amministratore."
      : null;
  const displayedError = errorMessage ?? urlReasonError;
  const isJustLoggedOut = searchParams.get("logged_out") === "1";

  useEffect(() => {
    if (isJustLoggedOut) return;
    if (!isSessionLoading && session?.user) {
      const user = session.user as SessionUserWithRole;
      if (user.role === "admin") {
        router.replace("/");
      }
    }
  }, [isJustLoggedOut, isSessionLoading, session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Inserisci email e password.");
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
            ? "Accesso negato: privilegi di amministratore richiesti."
            : error.message || "Credenziali non valide.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const loggedUser = data?.user as SessionUserWithRole | undefined;
      if (loggedUser && loggedUser.role && loggedUser.role !== "admin") {
        await authClient.signOut();
        const msg = "Accesso negato: privilegi di amministratore richiesti.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      toast.success("Accesso effettuato.");
      router.replace("/");
      router.refresh();
    } catch {
      const msg = "Errore di connessione al server di autenticazione.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-tg-chat px-4 py-12 text-tg-primary">
      <div className="w-full max-w-sm rounded-lg border border-tg-border bg-tg-surface p-6 shadow-sm">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tg-accent text-white">
            <CarFront className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-base font-bold text-tg-primary">
            KartGram Admin
          </h1>
          <p className="mt-1 text-xs text-tg-muted">
            Accedi con le tue credenziali di amministratore
          </p>
        </div>

        {displayedError && (
          <div className="mb-4 rounded-md border border-tg-danger/30 bg-tg-danger-soft p-2.5 text-xs text-tg-danger">
            {displayedError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-semibold text-tg-muted"
            >
              Email
            </label>
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
              className="h-9 w-full rounded-md border border-tg-border bg-tg-surface px-3 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-semibold text-tg-muted"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              placeholder="••••••••"
              className="h-9 w-full rounded-md border border-tg-border bg-tg-surface px-3 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 w-full rounded-md bg-tg-accent text-xs font-semibold text-white transition-colors hover:bg-tg-accent-hover disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <div className="mt-5 border-t border-tg-border pt-4 text-center text-xs text-tg-muted">
          Non hai un account?{" "}
          <Link
            href="/register"
            className="font-medium text-tg-accent hover:underline"
          >
            Registrati
          </Link>
        </div>
      </div>
    </div>
  );
}
