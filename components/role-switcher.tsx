"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { roleLabels } from "@/lib/session";
import type { UserRole } from "@/lib/types";

type SessionUser = {
  email: string;
  name: string;
  role: "CUSTOMER" | "MERCHANT" | "CHARITY" | "ADMIN";
};

function toUserRole(role?: string): UserRole | null {
  if (role === "MERCHANT") return "merchant";
  if (role === "ADMIN") return "admin";
  if (role === "CUSTOMER") return "customer";
  if (role === "CHARITY") return "charity";
  return null;
}

export function notifySessionChanged() {
  window.dispatchEvent(new Event("rescuefood-session-change"));
}

export function useSessionRole() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function syncSessionRole() {
      try {
        const response = await fetch("/api/auth/me", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();
        setRole(toUserRole((result.data as SessionUser | null)?.role));
      } catch {
        setRole(null);
      }
    }

    syncSessionRole();
    window.addEventListener("rescuefood-session-change", syncSessionRole);

    return () => {
      controller.abort();
      window.removeEventListener("rescuefood-session-change", syncSessionRole);
    };
  }, []);

  return role;
}

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const role = useSessionRole();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const label = role ? roleLabels[role] : "Masuk";

  useEffect(() => {
    const controller = new AbortController();

    async function syncUser() {
      try {
        const response = await fetch("/api/auth/me", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();
        setUser(result.data ?? null);
      } catch {
        setUser(null);
      }
    }

    syncUser();
    window.addEventListener("rescuefood-session-change", syncUser);

    return () => {
      controller.abort();
      window.removeEventListener("rescuefood-session-change", syncUser);
    };
  }, []);

  async function logout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Cookie dihapus server-side — tetap lanjutkan logout
    }
    setIsOpen(false);
    setUser(null);
    notifySessionChanged();
    // Paksa Next.js re-fetch semua server components di halaman aktif
    router.refresh();
    setIsLoggingOut(false);
  }

  if (compact) {
    if (!role) {
      return (
        <Link
          href="/auth"
          className="rf-focus-ring inline-flex h-10 items-center rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-3 text-sm font-extrabold text-rf-primary"
        >
          Masuk
        </Link>
      );
    }

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((c) => !c)}
          className="rf-focus-ring inline-flex h-10 items-center rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-3 text-sm font-extrabold text-rf-primary"
        >
          {label}
        </button>

        {isOpen && (
          <>
            {/* Backdrop — tutup dropdown saat klik di luar */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-12 z-50 w-64 rounded-rf-card border border-rf-outline-variant bg-rf-surface-base p-3 text-left shadow-[0_18px_50px_rgba(13,13,18,0.14)]">
              <p className="text-sm font-black text-rf-text-onyx">
                {user?.name ?? label}
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-rf-text-muted">
                {user?.email}
              </p>
              <div className="mt-3 grid gap-2">
                {(role === "merchant" || role === "admin") && (
                  <Link
                    href={role === "merchant" ? "/merchant" : "/admin/dashboard"}
                    className="rf-focus-ring rounded-rf-control bg-rf-surface-container-low px-3 py-2 text-sm font-extrabold text-rf-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-3 py-2 text-sm font-extrabold text-rf-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Profil
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-3 py-2 text-left text-sm font-extrabold text-rf-primary disabled:opacity-60"
                >
                  {isLoggingOut ? "Keluar..." : "Logout"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Non-compact (profile page sidebar)
  return (
    <div className="grid gap-3">
      <div className="rounded-rf-control bg-rf-surface-container-low p-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-rf-text-muted">
          Session
        </p>
        <p className="mt-1 text-base font-black text-rf-text-onyx">{label}</p>
      </div>
      <Link
        href="/auth"
        className="rf-focus-ring rounded-rf-control bg-rf-primary px-4 py-3 text-center text-sm font-extrabold text-white"
      >
        Login
      </Link>
      {role && (
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="rf-focus-ring rounded-rf-control border border-rf-outline-variant px-4 py-3 text-sm font-extrabold text-rf-primary transition hover:border-rf-primary disabled:opacity-60"
        >
          {isLoggingOut ? "Keluar..." : "Logout session"}
        </button>
      )}
    </div>
  );
}
