"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CarFront } from "lucide-react";
import {
  authClient,
  type SessionUserWithRole,
} from "@/lib/auth-client";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAdminNotice, setPendingAdminNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setPendingAdminNotice(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setErrorMessage("Compila tutti i campi obbligatori.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Le password non corrispondono.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (error) {
        const msg =
          error.message ||
          "Errore durante la registrazione. Verifica l'email inserita.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const registeredUser = data?.user as SessionUserWithRole | undefined;

      if (registeredUser?.role === "admin") {
        toast.success("Account registrato con successo.");
        router.replace("/");
        router.refresh();
        return;
      }

      await authClient.signOut();
      setPendingAdminNotice(true);
      toast.success(
        "Registrazione completata. Verifica i permessi admin per accedere."
      );
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
            Crea un Account
          </h1>
          <p className="mt-1 text-xs text-tg-muted">
            Registra una nuova utenza amministratore per Kart-Gram
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-md border border-tg-danger/30 bg-tg-danger-soft p-2.5 text-xs text-tg-danger">
            {errorMessage}
          </div>
        )}

        {pendingAdminNotice ? (
          <div className="space-y-4">
            <div className="rounded-md border border-tg-border bg-tg-secondary p-3 text-xs">
              <p className="font-semibold text-tg-success">
                Account creato: {email}
              </p>
              <p className="mt-1 text-tg-muted">
                Per completare l&apos;accesso alla dashboard è richiesto il ruolo{" "}
                <code className="rounded bg-tg-surface px-1 py-0.5 font-mono text-tg-primary">
                  admin
                </code>{" "}
                sul backend.
              </p>
            </div>
            <Link
              href="/login"
              className="flex h-9 w-full items-center justify-center rounded-md bg-tg-accent text-xs font-semibold text-white hover:bg-tg-accent-hover"
            >
              Vai al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-xs font-semibold text-tg-muted"
              >
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Mario Rossi"
                className="h-9 w-full rounded-md border border-tg-border bg-tg-surface px-3 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:outline-none"
              />
            </div>

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
                placeholder="mario@kartgram.com"
                className="h-9 w-full rounded-md border border-tg-border bg-tg-surface px-3 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-semibold text-tg-muted"
              >
                Password (min. 8 caratteri)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="••••••••"
                className="h-9 w-full rounded-md border border-tg-border bg-tg-surface px-3 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-xs font-semibold text-tg-muted"
              >
                Conferma Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="••••••••"
                className="h-9 w-full rounded-md border border-tg-border bg-tg-surface px-3 text-xs text-tg-primary placeholder:text-tg-muted transition-colors focus:border-tg-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-9 w-full rounded-md bg-tg-accent text-xs font-semibold text-white transition-colors hover:bg-tg-accent-hover disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Registrazione..." : "Registrati"}
            </button>
          </form>
        )}

        <div className="mt-5 border-t border-tg-border pt-4 text-center text-xs text-tg-muted">
          Hai già un account?{" "}
          <Link
            href="/login"
            className="font-medium text-tg-accent hover:underline"
          >
            Accedi
          </Link>
        </div>
      </div>
    </div>
  );
}
