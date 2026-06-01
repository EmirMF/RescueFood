"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifySessionChanged } from "@/components/role-switcher";
import type { UserRole } from "@/lib/types";

function toUserRole(role: string): UserRole {
  if (role === "MERCHANT") return "merchant";
  if (role === "ADMIN") return "admin";
  if (role === "CHARITY") return "charity";
  return "customer";
}

function getRedirectPath(role: UserRole) {
  if (role === "merchant") return "/merchant";
  if (role === "admin") return "/admin/dashboard";
  return "/marketplace";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login() {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        setError(result.error ?? "Email atau password tidak valid.");
        return;
      }

      const role = toUserRole(result.data.role);
      notifySessionChanged();
      router.push(getRedirectPath(role));
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        login();
      }}
    >
      <label className="block">
        <span className="sr-only">Email</span>
        <span className="relative block">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
            mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email Address"
            autoComplete="email"
            required
            className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-4 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20"
          />
        </span>
      </label>
      <label className="block">
        <span className="sr-only">Password</span>
        <span className="relative block">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
            lock
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-10 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rf-text-muted hover:text-rf-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </span>
      </label>
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-rf-text-muted">
          <input
            className="rounded border-rf-outline-variant bg-rf-surface text-rf-primary focus:ring-rf-primary"
            type="checkbox"
          />
          Ingat saya
        </label>
        <a className="text-sm font-semibold text-rf-primary hover:underline" href="#">
          Lupa password?
        </a>
      </div>
      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-rf-error-container px-4 py-3 text-sm font-semibold text-rf-error">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rf-focus-ring w-full rounded-full bg-rf-primary-container px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rf-primary disabled:cursor-not-allowed disabled:bg-rf-outline-variant transition-all active:scale-[0.98]"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">◌</span> Masuk...
          </span>
        ) : "Masuk"}
      </button>
    </form>
  );
}