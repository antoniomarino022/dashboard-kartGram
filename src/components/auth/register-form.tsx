"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAdminNotice, setPendingAdminNotice] = useState(false);

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
    setPendingAdminNotice(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setErrorMessage("Tutti i campi obbligatori devono essere compilati.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Le password non coincidono.");
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
          "Errore durante la registrazione. Verifica i dati o che l'email non sia già registrata.";
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      const registeredUser = data?.user as SessionUserWithRole | undefined;

      if (registeredUser?.role === "admin") {
        toast.success("Account Admin registrato con successo!");
        router.replace("/cars");
        router.refresh();
        return;
      }

      // Se il backend assegna un ruolo di default non-admin alla registrazione,
      // avvisa chiaramente l'utente e chiudi la sessione non-admin per evitare loop di redirect
      await authClient.signOut();
      setPendingAdminNotice(true);
      toast.success(
        "Registrazione completata! Verifica i permessi di amministratore per accedere."
      );
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
            Registrazione Admin
          </Title>
          <Subheadline level="2" className="!text-zinc-400">
            Crea un nuovo account per accedere alla Dashboard di Kart-Gram
          </Subheadline>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          {errorMessage && (
            <Section className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5">
              <Banner
                type="inline"
                before={<AlertCircle className="h-5 w-5 text-red-400" />}
                header="Errore di registrazione"
                description={errorMessage}
              />
            </Section>
          )}

          {pendingAdminNotice ? (
            <div className="space-y-5">
              <Section className="overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <Banner
                  type="inline"
                  before={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                  header="Account creato con successo!"
                  subheader={`Email registrata: ${email}`}
                  description="Assicurati che il tuo utente abbia il ruolo 'admin' nel backend per poter accedere alla dashboard."
                />
              </Section>

              <Link href="/login" className="block no-underline">
                <Button size="l" mode="filled" stretched>
                  Vai alla pagina di Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Section
                header="Dati Nuovo Amministratore"
                className="overflow-hidden rounded-xl border border-zinc-800/80"
              >
                <Input
                  id="name"
                  name="name"
                  type="text"
                  header="Nome Completo"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Admin Kart"
                  before={<User className="h-4 w-4 text-zinc-400" />}
                />

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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Minimo 8 caratteri"
                  before={<KeyRound className="h-4 w-4 text-zinc-400" />}
                />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  header="Conferma Password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Ripeti la password"
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
                Crea Account Admin
              </Button>
            </form>
          )}

          <div className="border-t border-zinc-800/80 pt-4 text-center">
            <Caption level="1" className="!text-zinc-400">
              Hai già un account amministratore?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-4"
              >
                Accedi qui
              </Link>
            </Caption>
          </div>
        </div>
      </div>
    </div>
  );
}
