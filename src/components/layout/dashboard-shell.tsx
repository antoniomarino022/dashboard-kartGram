"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  Caption,
  Cell,
  IconButton,
  Placeholder,
  Section,
  Spinner,
  Subheadline,
  Title,
} from "@telegram-apps/telegram-ui";
import {
  authClient,
  useSession,
  type SessionUserWithRole,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  CarFront,
  Disc,
  Flag,
  LogOut,
  Menu,
  Palette,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const NAV_ITEMS = [
  {
    href: "/cars",
    label: "Gestione Auto",
    emoji: "🏎",
    icon: CarFront,
    description: "Parco auto, velocità e vite",
  },
  {
    href: "/characters",
    label: "Gestione Personaggi",
    emoji: "👤",
    icon: Users,
    description: "Piloti, sottotipi e perk",
  },
  {
    href: "/maps",
    label: "Gestione Mappe",
    emoji: "🗺",
    icon: Flag,
    description: "Circuiti e ambientazioni",
  },
  {
    href: "/paints",
    label: "Gestione Vernici",
    emoji: "🎨",
    icon: Palette,
    description: "Colori e livree carrozzeria",
  },
  {
    href: "/wheels",
    label: "Gestione Ruote",
    emoji: "🛞",
    icon: Disc,
    description: "Set di ruote e vite extra",
  },
  {
    href: "/powerups",
    label: "Gestione Powerup",
    emoji: "⚡",
    icon: Zap,
    description: "Potenziamenti e abilità",
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = session?.user as SessionUserWithRole | undefined;
  const isAdmin = Boolean(user && user.role === "admin");
  const isPublicAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  useEffect(() => {
    if (isPublicAuthRoute) return;
    if (!isPending) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin") {
        toast.error(
          "Accesso negato: sono richiesti privilegi di amministratore."
        );
        router.replace("/login?reason=not_admin");
      }
    }
  }, [isPublicAuthRoute, isPending, user, router]);

  if (isPublicAuthRoute) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await authClient.signOut();
      toast.success("Disconnessione effettuata con successo.");
      router.replace("/login");
    } catch {
      toast.error("Errore durante il logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <Placeholder
          header="Verifica sessione amministratore..."
          description="Autenticazione Better Auth in corso"
        >
          <Spinner size="l" />
        </Placeholder>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <Placeholder
          header="Reindirizzamento al login..."
          description="Sessione non autorizzata o scaduta"
        >
          <Spinner size="l" />
        </Placeholder>
      </div>
    );
  }

  const userAcronym = (
    user.name?.slice(0, 2) ||
    user.email?.slice(0, 2) ||
    "AD"
  ).toUpperCase();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-zinc-800/80 bg-zinc-900/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
          <Link href="/cars" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-bold text-zinc-950 shadow-md shadow-orange-500/20">
              🏎
            </div>
            <div>
              <Title level="3" className="!text-base !font-bold !text-zinc-100">
                Kart-Gram
              </Title>
              <Caption
                level="2"
                className="!block !font-semibold uppercase tracking-wider !text-orange-400"
              >
                Telegram UI Admin
              </Caption>
            </div>
          </Link>
          <IconButton
            size="s"
            mode="gray"
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Chiudi menu"
          >
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Navigation Links via Telegram UI Section & Cell */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Section
            header="Catalogo & Sistema"
            className="overflow-hidden rounded-2xl border border-zinc-800/60"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="block no-underline"
                >
                  <Cell
                    before={
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-base">
                        {item.emoji}
                      </span>
                    }
                    subtitle={item.description}
                    after={
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform",
                          isActive ? "text-orange-400" : "text-zinc-500"
                        )}
                      />
                    }
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "!bg-orange-500/15 border-l-2 border-l-orange-500"
                        : "hover:!bg-zinc-800/50"
                    )}
                  >
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        isActive ? "text-orange-400" : "text-zinc-100"
                      )}
                    >
                      {item.label}
                    </span>
                  </Cell>
                </Link>
              );
            })}
          </Section>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <IconButton
              size="s"
              mode="bezeled"
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
            <div className="hidden sm:flex items-center gap-2">
              <Subheadline level="2" className="!text-zinc-400">
                Pannello di Controllo Amministratore
              </Subheadline>
              <Badge type="number" mode="secondary">
                Telegram Mini App Catalog
              </Badge>
            </div>
          </div>

          {/* Right User Profile + Admin Badge + Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800/90 bg-zinc-900/70 px-3 py-1.5">
              <Avatar size={28} acronym={userAcronym} />
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-1.5">
                  <Subheadline
                    level="2"
                    className="!text-xs !font-semibold !text-zinc-100"
                  >
                    {user.name || "Amministratore"}
                  </Subheadline>
                  <span className="inline-flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                </div>
                <Caption level="2" className="!block !text-zinc-400">
                  {user.email}
                </Caption>
              </div>
            </div>

            <Button
              type="button"
              size="s"
              mode="bezeled"
              onClick={handleSignOut}
              loading={isLoggingOut}
              disabled={isLoggingOut}
              before={<LogOut className="h-4 w-4" />}
              title="Disconnetti sessione"
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
