"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  authClient,
  useSession,
  type SessionUserWithRole,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  CarFront,
  Flag,
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-zinc-400">
          Verifica sessione amministratore...
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        <p className="text-sm text-zinc-400">Reindirizzamento al login...</p>
      </div>
    );
  }

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
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800/80 bg-zinc-900/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
          <Link href="/cars" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-lg font-bold text-zinc-950 shadow-md shadow-orange-500/20">
              🏎
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-zinc-100">
                Kart-Gram
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-orange-400">
                Admin Control
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
            aria-label="Chiudi menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Catalogo &amp; Sistema
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-orange-500/15 to-amber-500/5 text-orange-400 border border-orange-500/30 shadow-xs"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 border border-transparent"
                )}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <div className="flex-1 truncate">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-[11px] text-zinc-500 group-hover:text-zinc-400 truncate">
                    {item.description}
                  </div>
                </div>
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                    isActive ? "text-orange-400" : "text-zinc-600"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 lg:hidden"
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-zinc-400">
                Pannello di Controllo Amministratore
              </p>
            </div>
          </div>

          {/* Right User Profile + Admin Badge + Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800/90 bg-zinc-900/70 px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-sm font-bold text-orange-400 uppercase">
                {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
              </div>
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-100">
                    {user.name || "Amministratore"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                </div>
                <span className="block text-[11px] text-zinc-400">
                  {user.email}
                </span>
              </div>
              <span className="inline-flex md:hidden items-center gap-1 rounded-md border border-orange-500/30 bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                <ShieldCheck className="h-3 w-3" />
                Admin
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
              title="Disconnetti sessione"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </button>
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
