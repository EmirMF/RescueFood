import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { AuthTabs } from "@/components/auth-tabs";

const authImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4De6Y12d2jSWycCqgSP5OmT4ikOWfs4gWzC3igLU_lD5aycVBO1qkrMaHHv2tWPW76KTIh1io1_i-2U7mS2JE-Cd_TxTbfi48Zb5YQcvzjcHAcYUNTTD9ut2lnrr1Os5b-CQxX35cwRcR8SwSddI1Pg9esOK8Ht5L9s-cZrSjfADCydy0XMbrh5FSkJOi5IYGtMArDuAxtm_Xhg2ZufF8E9DwcjBwEejcQvPdcVlW1l1_VgOvp5NktM_bxyh4K-z4V3iNVBafaiI6";

interface AuthPageProps {
  searchParams: Promise<{ tab?: string; error?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const defaultTab = params.tab === "register" ? "register" : "login";
  const oauthError = params.error;

  const oauthErrorMessages: Record<string, string> = {
    google_denied: "Login Google dibatalkan.",
    google_not_configured: "Login Google belum dikonfigurasi.",
    google_token_failed: "Gagal mendapatkan token Google.",
    google_userinfo_failed: "Gagal mengambil info dari Google.",
    google_email_unverified: "Email Google belum diverifikasi.",
    account_suspended: "Akun Anda ditangguhkan. Hubungi admin.",
    oauth_error: "Terjadi kesalahan saat login dengan Google.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-rf-background p-4 text-rf-text-onyx md:p-8">
      <div className="relative z-10 flex min-h-[600px] w-full max-w-[1280px] flex-col overflow-hidden rounded-xl bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.06)] md:min-h-[840px] md:flex-row md:rounded-[24px]">
        {/* Back button */}
        <Link
          className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-full bg-rf-surface/80 px-4 py-2 text-rf-text-muted shadow-sm backdrop-blur-md transition-colors hover:text-rf-primary md:bg-transparent md:shadow-none md:backdrop-blur-none"
          href="/marketplace"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-semibold">Back to Marketplace</span>
        </Link>

        {/* Left: Form area */}
        <div className="relative flex w-full flex-col justify-start overflow-y-auto p-6 md:w-1/2 md:justify-center md:p-12 lg:p-16">
          <div className="mx-auto mt-14 w-full max-w-md md:mt-0">
            {/* Header */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-3xl text-rf-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  energy_savings_leaf
                </span>
                <span className="font-heading text-xl font-extrabold text-rf-primary">
                  RescueFood
                </span>
              </div>
              <h1 className="mb-2 font-heading text-2xl font-bold leading-8 tracking-[-0.01em] text-rf-text-onyx md:text-[32px] md:leading-10">
                Bergabung bersama kami
              </h1>
              <p className="text-base leading-6 tracking-[0.01em] text-rf-text-muted">
                Bersama untuk masa depan yang berkelanjutan.
              </p>
            </div>

            {/* OAuth error */}
            {oauthError && oauthErrorMessages[oauthError] && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rf-error-container px-4 py-3 text-sm font-semibold text-rf-error">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
                {oauthErrorMessages[oauthError]}
              </div>
            )}

            {/* Tab switcher + forms (client component) */}
            <AuthTabs defaultTab={defaultTab} />

            {/* Divider */}
            <div className="relative my-6 flex items-center">
              <div className="grow border-t border-rf-outline-variant/50" />
              <span className="mx-4 shrink-0 text-xs font-bold uppercase tracking-wider text-rf-text-muted">
                atau masuk dengan
              </span>
              <div className="grow border-t border-rf-outline-variant/50" />
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-1 gap-3">
              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-3 rounded-full border-2 border-rf-outline-variant px-4 py-2.5 text-sm font-semibold text-rf-text-onyx transition-all hover:border-rf-primary hover:bg-rf-surface-container-low hover:text-rf-primary active:scale-[0.98]"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Lanjutkan dengan Google
              </a>
            </div>

            <p className="mt-6 text-center text-xs text-rf-text-muted">
              Dengan mendaftar, kamu menyetujui{" "}
              <a href="#" className="font-semibold text-rf-primary hover:underline">
                Syarat & Ketentuan
              </a>{" "}
              dan{" "}
              <a href="#" className="font-semibold text-rf-primary hover:underline">
                Kebijakan Privasi
              </a>{" "}
              kami.
            </p>
          </div>
        </div>

        {/* Right: Hero image */}
        <div className="relative hidden w-full bg-rf-surface-container md:block md:w-1/2">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d9e6dd] to-rf-primary-fixed-dim opacity-30 mix-blend-multiply" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${authImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Floating stats card */}
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <div className="mb-5 max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md">
              <div className="mb-3 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-rf-primary-fixed text-rf-primary shadow-md">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    eco
                  </span>
                </div>
                <div>
                  <p className="font-heading text-[32px] font-bold leading-10">
                    12,450 kg
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                    Makanan Terselamatkan
                  </p>
                </div>
              </div>
              <p className="mt-1 text-sm leading-6 text-white/90">
                Bergabung bersama ribuan orang yang membuat dampak nyata bagi
                komunitas dan lingkungan.
              </p>
            </div>

            {/* Mini stats row */}
            <div className="flex gap-4">
              {[
                { icon: "storefront", value: "320+", label: "Merchant" },
                { icon: "group", value: "8,200+", label: "Pengguna" },
                { icon: "volunteer_activism", value: "45+", label: "Charity" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-1 flex-col items-center rounded-xl border border-white/20 bg-white/10 py-3 backdrop-blur-sm"
                >
                  <span
                    className="material-symbols-outlined mb-1 text-rf-primary-fixed"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {s.icon}
                  </span>
                  <p className="font-heading text-sm font-bold">{s.value}</p>
                  <p className="text-[10px] text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}