"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  GitBranch,
  Radio,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface MobileNavProps {
  /** Unread conversation count lifted from the shell so only one
   *  realtime channel is created for the entire dashboard. */
  totalUnread?: number;
}

export function MobileNav({ totalUnread = 0 }: MobileNavProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If in a chat thread on mobile, hide the bottom bar so keyboard + composer get full height
  const isInsideChat = pathname.startsWith("/inbox") && Boolean(searchParams.get("c"));
  if (isInsideChat) {
    return null;
  }

  const navItems = [
    {
      href: "/inbox",
      labelKey: "inbox",
      icon: MessageSquare,
      badge: totalUnread,
    },
    {
      href: "/contacts",
      labelKey: "contacts",
      icon: Users,
    },
    {
      href: "/pipelines",
      labelKey: "pipelines",
      icon: GitBranch,
    },
    {
      href: "/broadcasts",
      labelKey: "broadcasts",
      icon: Radio,
    },
    {
      href: "/dashboard",
      labelKey: "dashboard",
      icon: LayoutDashboard,
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-30 border-t border-border/80 bg-[var(--wa-header-bg)]/95 backdrop-blur-md pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] lg:hidden transition-transform duration-200"
    >
      <div className="flex h-14 items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors select-none",
                isActive
                  ? "text-[#00a884] dark:text-[#25D366] font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "scale-110" : ""
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-bold text-white shadow-xs">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight truncate max-w-[64px]">
                {t(item.labelKey as string)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
