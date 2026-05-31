"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifySessionChanged } from "@/components/role-switcher";
import type { UserRole } from "@/lib/types";

function toUserRole(role: string): UserRole {
  if (role === "MERCHANT") {
    return "merchant";
  }

  if (role === "ADMIN") {
    return "admin";
  }

  return "customer";
}

function getRedirectPath(role: UserRole) {
  if (role === "merchant") {
    return "/merchant";
  }

  if (role === "admin") {
    return "/admin/verification";
  }

  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login() {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
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
          className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-4 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary"
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
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-4 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary"
        />
        </span>
      </label>
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-rf-text-muted">
          <input
            className="rounded border-rf-outline-variant bg-rf-surface text-rf-primary focus:ring-rf-primary"
            type="checkbox"
          />
          Remember me
        </label>
        <a className="text-sm font-semibold text-rf-primary hover:underline" href="#">
          Forgot password?
        </a>
      </div>
      {error && (
        <p className="rounded-rf-control bg-rf-error-container px-4 py-3 text-sm font-extrabold text-rf-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rf-focus-ring w-full rounded-full bg-rf-primary-container px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rf-primary disabled:cursor-not-allowed disabled:bg-rf-outline-variant"
      >
        {isSubmitting ? "Masuk..." : "Masuk"}
      </button>
    </form>
  );
}
