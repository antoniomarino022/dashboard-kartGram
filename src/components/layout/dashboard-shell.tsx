"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CarFront,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ShieldAlert,
  Star,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  authClient,
  useSession,
  type SessionUserWithRole,
} from "@/lib/auth-client";
import { useItemsQuery, usePlayersQuery } from "@/hooks/use-admin-queries";
import { TgAvatar } from "@/components/ui/tg-avatar";
import { cn } from "@/lib/cn";
import { TrackBackdrop } from "./track-backdrop";

const PUBLIC_PATHS = ["/login", "/register"];

export const NAV_ITEMS = [
  { href: "/", label: "Panoramica", icon: LayoutDashboard },
  { key: "items", href: "/items", label: "Catalogo", icon: Package },
  { key: "players", href: "/players", label: "Giocatori", icon: Users },
  { href: "/payments", label: "Pagamenti", icon: Star },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  // il tema si conosce solo nel browser: fino ad allora l'icona non dipende dal tema (niente mismatch di idratazione)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  // conteggi per la sidebar: stesse query delle pagine, quindi già in cache
  const canQuery =
    !isPublicPage && (session?.user as SessionUserWithRole | undefined)?.role === "admin";
  const itemsQuery = useItemsQuery(canQuery);
  const playersQuery = usePlayersQuery("", 1, canQuery);

  // il drawer mobile si chiude con Esc
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  // Auth redirect
  useEffect(() => {
    if (!isPending && !session?.user && !isPublicPage && !isLoggingOut) {
      router.replace("/login");
    }
  }, [isPending, session, isPublicPage, isLoggingOut, router]);

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      queryClient.clear();
      await authClient.signOut();
    } catch {
      // Proceed even on network error
    } finally {
      toast.success("Sessione chiusa.");
      window.location.replace("/login?logged_out=1");
    }
  };

  if (isPublicPage) {
    return (
      <main className="min-h-screen bg-tg-chat text-tg-primary">{children}</main>
    );
  }

  const currentUser = session?.user as SessionUserWithRole | undefined;

  const counts: Record<string, number | undefined> = {
    items: itemsQuery.data?.length,
    players: playersQuery.data?.total,
  };

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-tg-chat text-tg-primary">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Clean Dashboard Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-tg-border bg-tg-surface transition-transform duration-200 md:static md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 shrink-0 items-center justify-between px-5">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-tg-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tg-accent text-tg-on-accent shadow-card">
              <CarFront className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-wide">KartGram</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Chiudi menu"
            className="rounded-lg p-2 text-tg-muted hover:bg-tg-secondary md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const count = item.key ? counts[item.key] : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                  isActive
                    ? "bg-tg-accent font-semibold text-tg-on-accent shadow-card"
                    : "text-tg-muted hover:bg-tg-hover hover:text-tg-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </div>
                {count !== undefined && (
                  <span
                    className={cn(
                      "min-w-7 rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums",
                      isActive
                        ? "bg-tg-on-accent/15 text-tg-on-accent"
                        : "bg-tg-secondary text-tg-muted"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Utente, tema e logout */}
        <div className="space-y-2 border-t border-tg-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <TgAvatar
              name={currentUser?.name || currentUser?.email || "Admin"}
             
              size="sm"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-tg-primary">
                {currentUser?.name || "Admin"}
              </span>
              <span className="truncate text-xs text-tg-muted">{currentUser?.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-tg-border text-sm font-medium text-tg-muted transition-colors hover:bg-tg-hover hover:text-tg-primary cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{isDark ? "Chiaro" : "Scuro"}</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-tg-border text-sm font-medium text-tg-muted transition-colors hover:border-tg-danger/40 hover:bg-tg-danger-soft hover:text-tg-danger cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top navbar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-tg-border bg-tg-surface px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Apri menu"
            className="rounded-lg p-2 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="font-display text-xl font-extrabold uppercase tracking-wide text-tg-primary">KartGram</span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Tema chiaro" : "Tema scuro"}
            className="rounded-lg p-2 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary cursor-pointer"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Page Content */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <TrackBackdrop />
          <div className="relative flex min-h-0 flex-1 flex-col">
            {/* le pagine partono solo con sessione admin: niente richieste prima dell'auth */}
            {currentUser?.role === "admin" ? children : <ShellSkeleton />}
          </div>
        </main>
      </div>

      {/* Non-admin alert overlay */}
      {!isPending &&
        !isLoggingOut &&
        currentUser &&
        currentUser.role !== "admin" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-tg-border bg-tg-surface p-6 text-center shadow-elevated">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-tg-danger-soft text-tg-danger">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-tg-primary">
                Accesso negato
              </h2>
              <p className="mt-2 text-sm text-tg-muted">{currentUser.email}</p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg bg-tg-danger px-4 py-2 text-sm font-semibold text-tg-on-danger hover:opacity-90 cursor-pointer"
                >
                  Disconnetti
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6 lg:px-10 lg:py-8" aria-busy="true">
      <div className="h-9 w-56 animate-pulse rounded-xl bg-tg-hover" />
      <div className="h-64 animate-pulse rounded-2xl bg-tg-surface shadow-card" />
    </div>
  );
}
