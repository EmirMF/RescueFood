import Link from "next/link";
import { LoginForm } from "@/components/login-form";

const authImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4De6Y12d2jSWycCqgSP5OmT4ikOWfs4gWzC3igLU_lD5aycVBO1qkrMaHHv2tWPW76KTIh1io1_i-2U7mS2JE-Cd_TxTbfi48Zb5YQcvzjcHAcYUNTTD9ut2lnrr1Os5b-CQxX35cwRcR8SwSddI1Pg9esOK8Ht5L9s-cZrSjfADCydy0XMbrh5FSkJOi5IYGtMArDuAxtm_Xhg2ZufF8E9DwcjBwEejcQvPdcVlW1l1_VgOvp5NktM_bxyh4K-z4V3iNVBafaiI6";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-rf-background p-4 text-rf-text-onyx md:p-8">
      <div className="relative z-10 flex min-h-[600px] w-full max-w-[1280px] flex-col overflow-hidden rounded-xl bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:min-h-[800px] md:flex-row md:rounded-[24px]">
        <Link
          className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-full bg-rf-surface/80 px-4 py-2 text-rf-text-muted shadow-sm backdrop-blur-md transition-colors hover:text-rf-primary md:bg-transparent md:shadow-none md:backdrop-blur-none"
          href="/"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-semibold">Back to Marketplace</span>
        </Link>

        <div className="relative flex w-full flex-col justify-center overflow-y-auto p-6 md:w-1/2 md:p-12 lg:p-16">
          <div className="mx-auto mt-12 w-full max-w-md md:mt-0">
            <div className="mb-8">
              <h1 className="mb-2 font-heading text-2xl font-bold leading-8 tracking-[-0.01em] text-rf-text-onyx md:text-[32px] md:leading-10">
                Join RescueFood
              </h1>
              <p className="text-base leading-6 tracking-[0.01em] text-rf-text-muted">
                Together for a sustainable future. Start saving food today.
              </p>
            </div>

            <div className="relative mb-8 flex rounded-full bg-rf-surface-variant p-1">
              <div className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] translate-x-0 rounded-full bg-white shadow-sm" />
              <button className="relative z-10 flex-1 py-2 text-sm font-semibold text-rf-primary" type="button">
                Log In
              </button>
              <button className="relative z-10 flex-1 py-2 text-sm font-semibold text-rf-text-muted" type="button">
                Sign Up
              </button>
            </div>

            <LoginForm />

            <div className="relative flex items-center py-6">
              <div className="grow border-t border-rf-outline-variant/50" />
              <span className="mx-4 shrink-0 text-xs font-bold uppercase tracking-wider text-rf-text-muted">
                Or log in with
              </span>
              <div className="grow border-t border-rf-outline-variant/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 rounded-full border border-rf-outline-variant px-4 py-2.5 text-sm font-semibold text-rf-text-onyx hover:bg-rf-surface-container-low" type="button">
                <span className="material-symbols-outlined text-lg">g_translate</span>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-full border border-rf-outline-variant px-4 py-2.5 text-sm font-semibold text-rf-text-onyx hover:bg-rf-surface-container-low" type="button">
                <span className="material-symbols-outlined text-lg">ios</span>
                Apple
              </button>
            </div>
          </div>
        </div>

        <div className="relative hidden w-full bg-rf-surface-container md:block md:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d9e6dd] to-rf-primary-fixed-dim opacity-30 mix-blend-multiply" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${authImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <div className="mb-8 max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md">
              <div className="mb-2 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-rf-primary-fixed text-rf-primary">
                  <span className="material-symbols-outlined text-2xl">eco</span>
                </div>
                <div>
                  <p className="font-heading text-[32px] font-bold leading-10">12,450 kg</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                    Food Rescued
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/90">
                Join thousands of others making a real impact on local
                communities and the environment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
