"use client";

import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

type Tab = "login" | "register";

interface AuthTabsProps {
  defaultTab?: Tab;
}

export function AuthTabs({ defaultTab = "login" }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <>
      {/* Tab toggle pill */}
      <div className="relative mb-6 flex rounded-full bg-rf-surface-variant p-1">
        {/* Sliding indicator */}
        <div
          className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
            activeTab === "register" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
          }`}
        />
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-200 ${
            activeTab === "login" ? "text-rf-primary" : "text-rf-text-muted"
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-200 ${
            activeTab === "register" ? "text-rf-primary" : "text-rf-text-muted"
          }`}
        >
          Daftar
        </button>
      </div>

      {/* Form panels */}
      <div className="relative">
        <div
          className={`transition-all duration-200 ${
            activeTab === "login"
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none absolute inset-0 opacity-0"
          }`}
        >
          <LoginForm />
        </div>
        <div
          className={`transition-all duration-200 ${
            activeTab === "register"
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none absolute inset-0 opacity-0"
          }`}
        >
          <RegisterForm />
        </div>
      </div>
    </>
  );
}
