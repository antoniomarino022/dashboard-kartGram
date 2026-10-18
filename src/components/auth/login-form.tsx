"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Banner,
  Button,
  Caption,
  Chip,
  Input,
  Section,
  Subheadline,
  Title,
} from "@telegram-apps/telegram-ui";
import {
  authClient,
  useSession,
  type SessionUserWithRole,
} from "@/lib/auth-client";
import { AlertCircle, KeyRound, Mail, ShieldCheck } from "lucide-react";
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
        const msg =
          "Accesso negato: sono richiesti privilegi di amministratore.";
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
          <Chip
            mode="outline"
            before={<ShieldCheck className="h-3.5 w-3.5 text-orange-400" />}
            className="!rounded-full !border-orange-500/30 !bg-orange-500/10 !text-orange-400 text-xs font-semibold"
          >
            Better Auth &bull; Telegram UI Admin
          </Chip>
          <Title level="1" className="!text-2xl !font-bold !text-zinc-100">
            Kart-Gram Admin
          </Title>
          <Subheadline level="2" className="!text-zinc-400">
            Accedi con le credenziali amministratore per gestire il catalogo di
            gioco
          </Subheadline>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          {displayedError && (
            <Section className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5">
              <Banner
                type="inline"
                before={<AlertCircle className="h-5 w-5 text-red-400" />}
                header="Errore di autenticazione"
                description={displayedError}
              />
            </Section>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Section
              header="Credenziali di Accesso"
              className="overflow-hidden rounded-xl border border-zinc-800/80"
            >
              <Input
                id="email"
                name="email"
                type="email"
                header="Email Amministratore"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder="admin@kartgram.com"
                before={<Mail className="h-4 w-4 text-zinc-400" />}
              />

              <Input
                id="password"
                name="password"
                type="password"
                header="Password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="••••••••••••"
                before={<KeyRound className="h-4 w-4 text-zinc-400" />}
              />
            </Section>

            <Button
              type="submit"
              size="l"
              mode="filled"
              stretched
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Accedi alla Dashboard
            </Button>
          </form>

          <div className="border-t border-zinc-800/80 pt-4 text-center">
            <Caption level="1" className="!text-zinc-400">
              Non hai ancora un account?{" "}
              <Link
                href="/register"
                className="font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-4"
              >
                Registrati
              </Link>
            </Caption>
          </div>
        </div>
      </div>
    </div>
  );
}
