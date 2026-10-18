"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CarFront } from "lucide-react";
import { TrackBackdrop } from "@/components/layout/track-backdrop";
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
      ? "Accesso negato"
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
      setErrorMessage("Inserisci email e password");
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
            ? "Accesso negato"
            : error.status === 401
              ? "Credenziali non valide"
              : error.message || "Credenziali non valide";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const loggedUser = data?.user as SessionUserWithRole | undefined;
      if (loggedUser && loggedUser.role && loggedUser.role !== "admin") {
        await authClient.signOut();
        const msg = "Accesso negato";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      toast.success("Accesso effettuato");
      router.replace("/");
      router.refresh();
    } catch {
      const msg = "Server non raggiungibile";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-tg-chat px-4 py-12 text-tg-primary">
      <TrackBackdrop />
      <div className="relative w-full max-w-sm rounded-2xl border border-tg-border bg-tg-surface/95 p-8 shadow-elevated backdrop-blur-sm">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tg-accent text-tg-on-accent">
            <CarFront className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-wide text-tg-primary">
            KartGram
          </h1>
        </div>

        {displayedError && (
          <div className="mb-4 rounded-xl border border-tg-danger/30 bg-tg-danger-soft p-2.5 text-sm text-tg-danger">
            {displayedError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-tg-primary"
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
              className="h-11 w-full rounded-xl border border-tg-border bg-tg-surface px-3.5 text-[15px] text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent-ink focus:outline-none focus:ring-2 focus:ring-tg-accent-ink/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-tg-primary"
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
              className="h-11 w-full rounded-xl border border-tg-border bg-tg-surface px-3.5 text-[15px] text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent-ink focus:outline-none focus:ring-2 focus:ring-tg-accent-ink/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-tg-accent text-sm font-semibold text-tg-on-accent transition-colors hover:bg-tg-accent-hover disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Accesso…" : "Accedi"}
          </button>
        </form>

      </div>
    </div>
  );
}
