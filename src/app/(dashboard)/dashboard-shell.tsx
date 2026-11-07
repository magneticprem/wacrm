"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AccountAccessAlert } from "@/components/layout/account-access-alert";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { BrowserNotificationsListener } from "@/components/notifications/browser-notifications-listener";
import { useTotalUnread } from "@/hooks/use-total-unread";
import { cn } from "@/lib/utils";

// Auth-gated dashboard shell. Extracted from the layout so the layout
// itself can stay a server component and export metadata (noindex) —
// client components can't export Next's metadata object.

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("DashboardShell");

  // Track whether the component has mounted on the client. On the very
  // first render both server AND client produce the same loading UI,
  // which avoids the hydration mismatch that used to happen when the
  // auth cookie was already available and the client immediately
  // resolved `loading=false` on the initial render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Sidebar drawer state — only used on mobile. On lg+ the sidebar is
  // always visible and this stays at `false` (ignored by the component).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const isInsideChat = pathname.startsWith("/inbox") && Boolean(searchParams.get("c"));

  // Lift unread count here so it's only subscribed once — both Sidebar
  // and MobileNav receive it as a prop instead of each creating their
  // own realtime channel (which caused the "cannot add callbacks after
  // subscribe()" error).
  const totalUnread = useTotalUnread();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Before the component has mounted on the client, or while auth is
  // still resolving, show the loading spinner. This guarantees the
  // server-rendered HTML and the first client render are identical.
  if (!mounted || loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Reports this tab's online/away presence once we know a user is
          signed in. Headless — renders nothing. */}
      <PresenceHeartbeat />
      {/* Desktop alerts for new customer messages (opt-in via Settings →
          Your profile). Headless — renders nothing. */}
      <BrowserNotificationsListener />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} totalUnread={totalUnread} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          className={cn(isInsideChat && "hidden lg:flex")}
        />
        {/* Thinner horizontal padding on mobile so cards have room to breathe;
            padded at the bottom for mobile nav bar unless inside a full-screen chat */}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            pathname.startsWith("/inbox")
              ? "p-4 sm:p-6"
              : "p-4 sm:p-6 pb-20 lg:pb-6"
          )}
        >
          {/* Above every page: writes are being rejected and here's why.
              Renders nothing unless the account/role failed to resolve. */}
          <AccountAccessAlert />
          {children}
        </main>
      </div>
      <MobileNav totalUnread={totalUnread} />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <DashboardShellInner>{children}</DashboardShellInner>
      </Suspense>
    </AuthProvider>
  );
}
