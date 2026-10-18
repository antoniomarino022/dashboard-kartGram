"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CarFront,
  CircleDot,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Palette,
  ShieldAlert,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  authClient,
  useSession,
  type SessionUserWithRole,
} from "@/lib/auth-client";
import {
  useCarsQuery,
  useCharactersQuery,
  useMapsQuery,
  usePaintsQuery,
  usePowerupsQuery,
  useWheelsQuery,
} from "@/hooks/use-catalog-queries";
import { TgAvatar } from "@/components/ui/tg-avatar";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui";

const PUBLIC_PATHS = ["/login", "/register"];

export const NAV_ITEMS = [
  {
    href: "/",
    label: "Panoramica",
    icon: LayoutDashboard,
  },
  {
    key: "cars",
    href: "/cars",
    label: "Auto",
    icon: CarFront,
  },
  {
    key: "characters",
    href: "/characters",
    label: "Piloti",
    icon: Users,
  },
  {
    key: "maps",
    href: "/maps",
    label: "Mappe",
    icon: MapPin,
  },
  {
    key: "paints",
    href: "/paints",
    label: "Vernici",
    icon: Palette,
  },
  {
    key: "wheels",
    href: "/wheels",
    label: "Ruote",
    icon: CircleDot,
  },
  {
    key: "powerups",
    href: "/powerups",
    label: "Powerup",
    icon: Zap,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const carsQuery = useCarsQuery();
  const charactersQuery = useCharactersQuery();
  const mapsQuery = useMapsQuery();
  const paintsQuery = usePaintsQuery();
  const wheelsQuery = useWheelsQuery();
  const powerupsQuery = usePowerupsQuery();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  // Sync dark class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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

  const counts: Record<string, number> = {
    cars: carsQuery.data?.length ?? 0,
    characters: charactersQuery.data?.length ?? 0,
    maps: mapsQuery.data?.length ?? 0,
    paints: paintsQuery.data?.length ?? 0,
    wheels: wheelsQuery.data?.length ?? 0,
    powerups: powerupsQuery.data?.length ?? 0,
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-tg-border bg-tg-surface transition-transform duration-200 md:static md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-tg-border px-5">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 font-bold tracking-tight text-tg-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tg-accent text-white">
              <CarFront className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold leading-none">KartGram</span>
              <span className="text-[10px] font-medium text-tg-muted">
                Admin Dashboard
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1 text-tg-muted hover:bg-tg-secondary md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-tg-muted">
            Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const count = item.key ? counts[item.key] : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-tg-accent text-white"
                    : "text-tg-muted hover:bg-tg-secondary hover:text-tg-primary"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {count !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-white"
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

        {/* User profile & Theme toggle footer */}
        <div className="border-t border-tg-border p-3">
          <div className="mb-2 flex items-center justify-between rounded-lg bg-tg-secondary p-2.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <TgAvatar
                name={currentUser?.name || currentUser?.email || "Admin"}
                seed={currentUser?.email || "admin"}
                size="sm"
              />
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-tg-primary">
                  {currentUser?.name || "Admin"}
                </span>
                <span className="truncate text-[10px] text-tg-muted">
                  {currentUser?.email}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Tema chiaro" : "Tema scuro"}
              className="rounded-md p-1.5 text-tg-muted hover:bg-tg-surface hover:text-tg-primary cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-tg-border bg-tg-surface py-1.5 text-xs font-semibold text-tg-muted transition-colors hover:bg-tg-danger-soft hover:text-tg-danger cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top navbar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-tg-border bg-tg-surface px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-1.5 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="text-sm font-bold text-tg-primary">KartGram Admin</span>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-tg-muted hover:bg-tg-secondary hover:text-tg-primary cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>

      {/* Non-admin alert overlay */}
      {!isPending &&
        !isLoggingOut &&
        currentUser &&
        currentUser.role !== "admin" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-tg-border bg-tg-surface p-6 text-center shadow-xl">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-tg-danger-soft text-tg-danger">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-tg-primary">
                Accesso Riservato agli Amministratori
              </h2>
              <p className="mt-2 text-xs text-tg-muted">
                Connesso come <strong>{currentUser.email}</strong>. Questo account
                non dispone dei permessi di amministratore.
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg bg-tg-danger px-4 py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer"
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
