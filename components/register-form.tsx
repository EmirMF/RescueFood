"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifySessionChanged } from "@/components/role-switcher";
import type { UserRole } from "@/lib/types";

type RegisterRole = "CUSTOMER" | "MERCHANT" | "CHARITY";

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

// Harus identik dengan validatePassword di lib/password-validation.ts
function validatePasswordClient(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Minimal 8 karakter");
  if (password.length > 128) errors.push("Maksimal 128 karakter");
  if (!/[A-Z]/.test(password)) errors.push("Minimal 1 huruf besar (A-Z)");
  if (!/[a-z]/.test(password)) errors.push("Minimal 1 huruf kecil (a-z)");
  if (!/[0-9]/.test(password)) errors.push("Minimal 1 angka (0-9)");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push("Minimal 1 karakter spesial (!@#$%^&* dll)");
  return errors;
}

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "", bars: ["", "", "", ""] };
  const errors = validatePasswordClient(pwd);
  // score 0–4 berdasarkan berapa rule yang terpenuhi (ada 4 complexity rules)
  const complexityPassed = 4 - Math.max(0, errors.filter(e =>
    e.includes("huruf besar") || e.includes("huruf kecil") ||
    e.includes("angka") || e.includes("karakter spesial")
  ).length);
  const score = pwd.length < 8 ? 0 : complexityPassed;
  const configs = [
    { label: "", bars: ["bg-rf-outline-variant", "bg-rf-outline-variant", "bg-rf-outline-variant", "bg-rf-outline-variant"] },
    { label: "Lemah", bars: ["bg-rf-error", "bg-rf-outline-variant", "bg-rf-outline-variant", "bg-rf-outline-variant"] },
    { label: "Sedang", bars: ["bg-amber-400", "bg-amber-400", "bg-rf-outline-variant", "bg-rf-outline-variant"] },
    { label: "Kuat", bars: ["bg-emerald-400", "bg-emerald-400", "bg-emerald-400", "bg-rf-outline-variant"] },
    { label: "Sangat Kuat", bars: ["bg-rf-primary", "bg-rf-primary", "bg-rf-primary", "bg-rf-primary"] },
  ];
  return { score, ...configs[score] };
}

const roleOptions: { value: RegisterRole; label: string; icon: string; desc: string }[] = [
  { value: "CUSTOMER", label: "Customer", icon: "person", desc: "Beli makanan surplus" },
  { value: "MERCHANT", label: "Merchant", icon: "storefront", desc: "Jual makanan surplus" },
  { value: "CHARITY", label: "Charity", icon: "volunteer_activism", desc: "Terima donasi" },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RegisterRole>("CUSTOMER");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(password);
  const pwdErrors = validatePasswordClient(password);
  const isPasswordValid = password.length > 0 && pwdErrors.length === 0;
  const isConfirmValid = confirmPassword === password && confirmPassword.length > 0;

  async function register() {
    setErrors([]);

    // Validasi frontend lengkap sesuai server rules
    const validationErrors: string[] = [];
    if (!name.trim()) validationErrors.push("Nama lengkap wajib diisi.");
    if (!email.trim()) validationErrors.push("Email wajib diisi.");

    const pwdIssues = validatePasswordClient(password);
    if (pwdIssues.length > 0) {
      validationErrors.push(...pwdIssues.map(e => `Password: ${e}`));
    }
    if (password !== confirmPassword) {
      validationErrors.push("Konfirmasi password tidak cocok.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const result = await response.json();

      if (!response.ok) {
        // Tampilkan error dari server (bisa string atau array dari validatePassword)
        const serverError = result.error ?? "Registrasi gagal. Coba lagi.";
        setErrors(Array.isArray(serverError) ? serverError : [serverError]);
        return;
      }

      if (!result.data) {
        setErrors(["Respons server tidak valid. Coba lagi."]);
        return;
      }

      const userRole = toUserRole(result.data.role);
      notifySessionChanged();
      router.push(getRedirectPath(userRole));
      router.refresh();
    } catch {
      setErrors(["Tidak bisa terhubung ke server. Periksa koneksi internet kamu."]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        register();
      }}
    >
      {/* Role selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-rf-text-onyx">
          Saya adalah...
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="role"
                value={opt.value}
                checked={role === opt.value}
                onChange={() => setRole(opt.value)}
                className="sr-only peer"
              />
              <div className="h-full rounded-xl border border-rf-outline-variant p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all peer-checked:border-rf-primary peer-checked:bg-rf-primary/5 peer-checked:text-rf-primary hover:bg-rf-surface-container-low">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: role === opt.value ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {opt.icon}
                </span>
                <span className="text-xs font-bold">{opt.label}</span>
                <span className="text-[10px] text-rf-text-muted leading-tight hidden sm:block">
                  {opt.desc}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Full Name */}
      <label className="block">
        <span className="sr-only">Nama Lengkap</span>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
            badge
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Lengkap"
            autoComplete="name"
            className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-4 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20"
          />
        </div>
      </label>

      {/* Email */}
      <label className="block">
        <span className="sr-only">Email</span>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
            mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            autoComplete="email"
            className="rf-focus-ring w-full rounded-xl border border-rf-outline-variant bg-rf-surface py-3 pl-10 pr-4 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:border-rf-primary focus:ring-2 focus:ring-rf-primary/20"
          />
        </div>
      </label>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block">
          <span className="sr-only">Password</span>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
              lock
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              className={`rf-focus-ring w-full rounded-xl border py-3 pl-10 pr-10 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:ring-2 transition-colors ${
                password && !isPasswordValid
                  ? "border-rf-error focus:border-rf-error focus:ring-rf-error/20 bg-rf-surface"
                  : password && isPasswordValid
                  ? "border-emerald-400 focus:border-rf-primary focus:ring-rf-primary/20 bg-rf-surface"
                  : "border-rf-outline-variant focus:border-rf-primary focus:ring-rf-primary/20 bg-rf-surface"
              }`}
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
          </div>
        </label>

        {/* Strength bar */}
        {password && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {strength.bars.map((bar, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${bar}`} />
              ))}
            </div>
            <div className="flex items-start justify-between gap-3">
              {strength.label && (
                <span className={`text-xs font-semibold ${
                  strength.score >= 4 ? "text-rf-primary" :
                  strength.score === 3 ? "text-emerald-600" :
                  strength.score === 2 ? "text-amber-600" : "text-rf-error"
                }`}>
                  {strength.label}
                </span>
              )}
            </div>
            {/* Requirement checklist */}
            {pwdErrors.length > 0 && (
              <ul className="space-y-0.5">
                {[
                  { test: password.length >= 8, label: "Min. 8 karakter" },
                  { test: /[A-Z]/.test(password), label: "1 huruf besar (A-Z)" },
                  { test: /[a-z]/.test(password), label: "1 huruf kecil (a-z)" },
                  { test: /[0-9]/.test(password), label: "1 angka (0-9)" },
                  { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: "1 karakter spesial" },
                ].map(({ test, label }) => (
                  <li key={label} className={`flex items-center gap-1.5 text-xs ${test ? "text-emerald-600" : "text-rf-text-muted"}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {test ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <label className="block">
        <span className="sr-only">Konfirmasi Password</span>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rf-text-muted">
            lock_check
          </span>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Konfirmasi Password"
            autoComplete="new-password"
            className={`rf-focus-ring w-full rounded-xl border py-3 pl-10 pr-10 text-base text-rf-text-onyx outline-none placeholder:text-rf-text-muted/60 focus:ring-2 transition-colors ${
              confirmPassword && !isConfirmValid
                ? "border-rf-error bg-rf-error-container/10 focus:border-rf-error focus:ring-rf-error/20"
                : isConfirmValid
                ? "border-emerald-400 bg-emerald-50/30 focus:border-rf-primary focus:ring-rf-primary/20"
                : "border-rf-outline-variant bg-rf-surface focus:border-rf-primary focus:ring-rf-primary/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-rf-text-muted hover:text-rf-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {showConfirmPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
          {confirmPassword && (
            <span
              className={`material-symbols-outlined absolute right-10 top-1/2 -translate-y-1/2 text-xl ${
                isConfirmValid ? "text-emerald-500" : "text-rf-error"
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isConfirmValid ? "check_circle" : "cancel"}
            </span>
          )}
        </div>
        {confirmPassword && !isConfirmValid && (
          <p className="mt-1 text-xs text-rf-error">Password tidak cocok</p>
        )}
      </label>

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-rf-text-muted">
        <input
          type="checkbox"
          required
          className="mt-0.5 shrink-0 rounded border-rf-outline-variant text-rf-primary focus:ring-rf-primary"
        />
        <span>
          Saya menyetujui{" "}
          <a href="#" className="font-semibold text-rf-primary hover:underline">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a href="#" className="font-semibold text-rf-primary hover:underline">
            Kebijakan Privasi
          </a>{" "}
          RescueFood
        </span>
      </label>

      {/* Error list */}
      {errors.length > 0 && (
        <div className="rounded-xl bg-rf-error-container px-4 py-3">
          {errors.length === 1 ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-rf-error">
              <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {errors[0]}
            </p>
          ) : (
            <>
              <p className="flex items-center gap-2 text-sm font-bold text-rf-error mb-1">
                <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                Perbaiki dulu:
              </p>
              <ul className="space-y-0.5 pl-6">
                {errors.map((e, i) => (
                  <li key={i} className="text-sm text-rf-error list-disc">{e}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rf-focus-ring w-full rounded-full bg-rf-primary-container px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rf-primary disabled:cursor-not-allowed disabled:opacity-60 transition-all active:scale-[0.98]"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Membuat akun...
          </span>
        ) : (
          "Buat Akun"
        )}
      </button>
    </form>
  );
}