"use client";

import Link from "next/link";
import { NotificationBell } from "@/components/notification-bell";
import { RoleSwitcher, useSessionRole } from "@/components/role-switcher";
import type { UserRole } from "@/lib/types";

type HeaderAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type AppHeaderProps = {
  actions?: HeaderAction[];
  active?: "marketplace" | "impact" | "merchant" | "admin" | "wishlist" | "notifications";
  showSession?: boolean;
};

const navItems: Array<{
  href: string;
  key: AppHeaderProps["active"];
  label: string;
  roles?: UserRole[];
}> = [
  { href: "/", label: "Marketplace", key: "marketplace" },
  { href: "/impact", label: "Impact", key: "impact" },
  { href: "/merchant", label: "Merchant", key: "merchant", roles: ["merchant", "admin"] },
  { href: "/admin/verification", label: "Admin", key: "admin", roles: ["admin"] },
];

export function AppHeader({
  actions = [],
  active,
  showSession = false,
}: AppHeaderProps) {
  const role = useSessionRole();
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) {
      return true;
    }

    return role ? item.roles.includes(role) : false;
  });
  const visibleActions = actions.filter((action) => {
    if (action.href === "/auth") {
      return false;
    }

    if (action.href === "/profile" && role) {
      return false;
    }

    if (action.href.startsWith("/merchant") && role !== "merchant" && role !== "admin") {
      return false;
    }

    if (action.href.startsWith("/admin") && role !== "admin") {
      return false;
    }

    return true;
  });

  return (
    <header className="sticky top-0 z-50 border-b border-rf-outline-variant/30 bg-rf-surface/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 py-4 md:px-16">
        <Link href="/" className="rf-focus-ring flex min-w-0 items-center gap-2 rounded-rf-control font-heading text-[32px] font-extrabold leading-10 text-rf-primary">
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            energy_savings_leaf
          </span>
          <span className="truncate">RescueFood</span>
        </Link>

        <nav className="hidden items-center gap-8 font-heading text-xl font-semibold leading-7 md:flex">
          {visibleNavItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rf-focus-ring border-b-2 rounded-none pb-1 transition ${
                active === item.key
                  ? "border-rf-primary text-rf-primary"
                  : "border-transparent text-rf-text-muted hover:text-rf-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          {showSession && role && (
            <>
              <NotificationBell />
              {role === "customer" && (
                <Link
                  href="/wishlist"
                  className={`rf-focus-ring inline-flex h-10 items-center rounded-rf-control border px-3 text-sm font-extrabold transition ${
                    active === "wishlist"
                      ? "border-rf-primary bg-rf-primary text-white"
                      : "border-rf-outline-variant bg-rf-surface-base text-rf-primary hover:bg-rf-surface-container"
                  }`}
                  aria-label="Wishlist"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: active === "wishlist" ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                </Link>
              )}
            </>
          )}
          {visibleActions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className={`rf-focus-ring rounded-full px-6 py-2 text-sm font-semibold transition ${
                action.variant === "primary"
                  ? "bg-rf-primary-container text-white hover:bg-rf-primary-fixed hover:text-rf-text-onyx"
                  : "border-2 border-rf-primary-container bg-rf-surface text-rf-primary-container hover:bg-rf-surface-container-high"
              }`}
            >
              {action.label}
            </Link>
          ))}
          <RoleSwitcher compact />
        </div>
      </div>
    </header>
  );
}
