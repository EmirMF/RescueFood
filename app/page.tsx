import Link from "next/link";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCV5h07ckcruLbOEI1QtWIu-ETKSucTCAgJX1g3VV8-30XT4SR1_eNFNdGe0D_KowXJIW42ubIcaE4qGNYSm8m0yoL2CDCXAicawJB1-uBAnGDJYrvy2pBAcMb63pYjzkzBN6IkMsJ3ZdESptJjCuVBSryzfp0yDm60sdXmYzO_51-C-5S47mMT4dXBrz_VEtxlQVD4w41Bb6t4W0w9VdDD5LU9gMLh7haGBm5Qfy4D_jBoWPuxZSzYgab8t3-EQo0Cw3VaAMKCdJpI";

const MERCHANT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCrdRyT2RdbmCrVbCCqZijnDiKiukcV4Ge60x3IIYfwVn6dlN3dFEnXvs35HNij2ivpSlinMgiwTuiAlRluLdwxfZ__D1FuwStlwmGA7rJS03NDtzQdqyr1-7QHXShUMG84gmpTyTe75_RazTYAjFnNk-fIuW6QbgGaqZFIwrHii50NgDUKmhzPpFFnnkJZu4iIi1mWcZgsBksNspcBlUBpHK9aB6A6VEYFf9jw6igSgPUxi0X2SbHYt4PBGTbNWJ7fLXf8HF9c7R7e";

const trustItems = [
  ["percent", "Hemat hingga 70%"],
  ["verified", "Merchant terverifikasi"],
  ["electric_moped", "Pickup cepat & mudah"],
  ["compost", "Kurangi food waste"],
];

const steps = [
  {
    icon: "search",
    title: "Temukan",
    body: "Cari makanan surplus dari merchant terdekat di sekitarmu.",
  },
  {
    icon: "shopping_bag",
    title: "Pesan",
    body: "Pilih menu favorit dan lakukan pemesanan dengan aman.",
  },
  {
    icon: "storefront",
    title: "Ambil",
    body: "Ambil pesananmu sesuai waktu yang ditentukan langsung di toko.",
  },
];

const impactStats = [
  ["eco", "1.240+", "Makanan Terselamatkan (porsi)"],
  ["storefront", "320+", "Merchant Aktif bergabung"],
  ["favorite", "25.000+", "Transaksi Berhasil sepanjang waktu"],
];

const merchantBenefits = [
  ["groups", "Jangkau lebih banyak pelanggan baru"],
  ["schedule", "Proses mudah dan cepat"],
  ["globe_asia", "Dampak positif untuk lingkungan"],
];

const faqs = [
  {
    question: "Apa itu RescueFood?",
    answer:
      "RescueFood adalah platform yang menghubungkan konsumen dengan merchant yang memiliki makanan surplus berkualitas untuk mengurangi limbah makanan.",
  },
  {
    question: "Bagaimana cara memesan makanan?",
    answer:
      "Cukup buka aplikasi atau website, cari merchant terdekat, pilih menu surplus yang tersedia, dan selesaikan pembayaran dengan aman.",
  },
  {
    question: "Kapan dan di mana saya bisa mengambil pesanan?",
    answer:
      "Anda dapat mengambil pesanan langsung di lokasi merchant sesuai dengan jendela waktu pengambilan yang ditentukan setelah pesanan dikonfirmasi.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 z-50 w-full bg-surface/80 font-label-md text-label-md text-primary shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out">
        <div className="mx-auto flex h-20 max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
          <Link
            href="/"
            className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary transition-opacity hover:opacity-80 md:font-headline-lg md:text-headline-lg"
          >
            RescueFood
          </Link>
          <nav className="hidden gap-8 md:flex">
            <a className="text-on-surface-variant transition-opacity hover:text-primary hover:opacity-80" href="#cara-kerja">
              Cara Kerja
            </a>
            <a className="text-on-surface-variant transition-opacity hover:text-primary hover:opacity-80" href="#untuk-merchant">
              Untuk Merchant
            </a>
            <a className="text-on-surface-variant transition-opacity hover:text-primary hover:opacity-80" href="#impact">
              Impact
            </a>
            <a className="text-on-surface-variant transition-opacity hover:text-primary hover:opacity-80" href="#faq">
              FAQ
            </a>
          </nav>
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/auth"
              className="rounded-full border-2 border-primary px-6 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-primary/5"
            >
              Login
            </Link>
            <Link
              href="/auth"
              className="rounded-full bg-primary-container px-6 py-2 font-label-md text-label-md text-on-primary shadow-[0px_4px_14px_rgba(21,128,61,0.2)] transition-opacity hover:opacity-90"
            >
              Register
            </Link>
          </div>
          <Link aria-label="Menu" href="/auth" className="flex items-center justify-center p-2 text-primary md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </Link>
        </div>
      </header>

      <main className="pb-[80px] pt-28">
        <section className="mx-auto mb-[80px] max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="grid min-h-[60vh] grid-cols-1 items-center gap-gutter lg:grid-cols-2">
            <div className="z-10 flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container/30 px-4 py-2 font-label-sm text-label-sm text-[#007432]">
                <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">eco</span>
                Bersama kurangi limbah makanan
              </div>
              <h1 className="max-w-xl font-headline-xl text-headline-xl leading-tight text-on-surface">
                Selamatkan Makanan, <br />
                Kurangi Limbah.
              </h1>
              <p className="max-w-lg font-body-lg text-body-lg text-on-surface-variant">
                Dapatkan makanan surplus berkualitas dari merchant favoritmu dengan harga jauh lebih hemat. Bersama kita wujudkan lingkungan yang lebih baik.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  href="/auth"
                  className="flex items-center gap-2 rounded-full bg-primary-container px-8 py-3 font-label-md text-label-md text-on-primary shadow-[0px_8px_20px_rgba(21,128,61,0.25)] transition-opacity hover:opacity-90"
                >
                  Mulai Sekarang
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a
                  href="#cara-kerja"
                  className="rounded-full border-2 border-outline-variant px-8 py-3 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                >
                  Lihat Cara Kerja
                </a>
              </div>
            </div>

            <div className="relative flex min-h-[400px] w-full items-center justify-center">
              <div className="absolute inset-0 z-0 scale-95 rounded-[3rem] bg-[#6bff8f]/20 blur-xl -rotate-6" />
              <div className="absolute inset-0 z-0 overflow-hidden rounded-[3rem] bg-surface-container-highest">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="A bright, modern light-mode composition showing fresh groceries and healthy food in a sustainable lifestyle setting."
                  className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                  src={HERO_IMAGE}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 z-20 flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface p-4 shadow-[0px_20px_40px_rgba(21,128,61,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-[#007432]">
                  <span className="material-symbols-outlined [font-variation-settings:'FILL'_1]">savings</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Hemat hingga</p>
                  <p className="font-title-md text-title-md text-primary">70%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-[80px] max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-wrap justify-between gap-6 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] md:flex-nowrap md:p-8">
            {trustItems.map(([icon, label], index) => (
              <div className="contents" key={label}>
                <div className="flex w-full items-center justify-center gap-3 md:w-auto md:justify-start">
                  <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
                  <span className="font-label-md text-label-md text-on-surface">{label}</span>
                </div>
                {index < trustItems.length - 1 && <div className="hidden w-px bg-outline-variant/30 md:block" />}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mb-[80px] max-w-container-max px-margin-mobile md:px-margin-desktop" id="cara-kerja">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">Cara Kerja</h2>
            <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Tiga langkah mudah untuk mulai menyelamatkan makanan dan menikmati hidangan lezat dengan harga hemat.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-[15%] right-[15%] top-1/2 z-0 hidden h-0.5 -translate-y-1/2 border-t-2 border-dashed border-outline-variant/60 bg-outline-variant/40 md:block" />
            <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  className="flex flex-col items-center rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center shadow-[0px_10px_30px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-2"
                  key={step.title}
                >
                  <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-container-highest">
                    <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary-container font-label-md text-label-md text-on-primary">
                      {index + 1}
                    </div>
                    <span className="material-symbols-outlined text-4xl text-primary">{step.icon}</span>
                  </div>
                  <h3 className="mb-2 font-title-md text-title-md text-on-surface">{step.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mb-[80px] max-w-container-max px-margin-mobile md:px-margin-desktop" id="impact">
          <div className="relative overflow-hidden rounded-[2rem] bg-surface-container p-8 md:p-12">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-[#6bff8f]/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/2 rounded-full bg-[#95f8a7]/20 blur-3xl" />
            <div className="relative z-10">
              <h2 className="mb-8 text-center font-headline-lg text-headline-lg text-on-surface md:text-left">
                Dampak Nyata Bersama RescueFood
              </h2>
              <div className="grid grid-cols-1 gap-8 divide-y divide-outline-variant/30 md:grid-cols-3 md:gap-4 md:divide-x md:divide-y-0">
                {impactStats.map(([icon, value, label], index) => (
                  <div className={`flex flex-col items-center px-4 pt-6 md:items-start md:pt-0 ${index > 0 ? "md:pl-8" : ""}`} key={label}>
                    <div className="mb-2 flex items-center gap-4">
                      <span className="material-symbols-outlined text-4xl text-primary [font-variation-settings:'FILL'_1]">{icon}</span>
                      <span className="font-headline-xl text-headline-xl text-primary">{value}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center font-label-sm text-label-sm text-outline opacity-70">Data per Mei 2025</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-[80px] max-w-container-max px-margin-mobile md:px-margin-desktop" id="untuk-merchant">
          <div className="flex flex-col overflow-hidden rounded-[2rem] bg-primary text-on-primary shadow-[0px_20px_40px_rgba(21,128,61,0.15)] md:flex-row">
            <div className="flex flex-col justify-center p-8 md:w-2/3 md:p-12">
              <h2 className="mb-4 font-headline-lg text-headline-lg">
                Punya surplus makanan?
                <br />
                Jadi Merchant RescueFood
              </h2>
              <p className="mb-8 max-w-xl font-body-lg text-body-lg text-[#79db8d]">
                Gabung bersama ribuan merchant lainnya dan ubah surplus jadi manfaat nyata. Jangkau pelanggan baru sambil mengurangi jejak karbon.
              </p>
              <div className="mb-8 flex flex-wrap gap-6">
                {merchantBenefits.map(([icon, label]) => (
                  <div className="flex items-center gap-2" key={label}>
                    <span className="material-symbols-outlined text-[#6bff8f]">{icon}</span>
                    <span className="font-label-md text-label-md">{label}</span>
                  </div>
                ))}
              </div>
              <div>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-surface px-8 py-4 font-label-md text-label-md text-primary shadow-sm transition-colors hover:bg-surface-container-low"
                >
                  Gabung Jadi Merchant
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>
            <div className="relative min-h-[300px] bg-primary-container/50 md:w-1/3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="A welcoming small cafe storefront with green awning and plants."
                className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
                src={MERCHANT_IMAGE}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto mb-[80px] max-w-container-max px-margin-mobile md:px-margin-desktop" id="faq">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">Pertanyaan Umum</h2>
            <p className="mx-auto max-w-2xl font-body-md text-body-md text-on-surface-variant">
              Temukan jawaban untuk pertanyaan yang sering diajukan mengenai layanan RescueFood.
            </p>
          </div>
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {faqs.map((faq) => (
              <details className="group overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low" key={faq.question}>
                <summary className="flex w-full cursor-pointer list-none items-center justify-between px-6 py-4 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-title-md text-title-md text-on-surface">{faq.question}</span>
                  <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180">expand_more</span>
                </summary>
                <div className="px-6 pb-4 font-body-md text-body-md text-on-surface-variant">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full rounded-t-[2rem] border-t border-outline-variant/10 bg-surface-container-highest px-margin-mobile pb-8 pt-16 font-body-md text-body-md text-primary shadow-[0px_-10px_30px_rgba(0,0,0,0.02)] md:px-margin-desktop">
        <div className="mx-auto mb-12 grid max-w-container-max grid-cols-1 gap-gutter md:grid-cols-4">
          <div>
            <Link className="mb-6 block font-headline-lg text-headline-lg font-extrabold text-primary" href="/">
              RescueFood
            </Link>
            <p className="mb-6 text-sm text-on-surface-variant">
              Setiap pilihan kecilmu, berdampak besar untuk masa depan bumi. Mari kurangi limbah makanan bersama.
            </p>
            <div className="flex gap-4">
              {["camera_alt", "thumb_up"].map((icon) => (
                <a className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm transition-transform hover:-translate-y-1" href="#" key={icon}>
                  <span className="material-symbols-outlined [font-variation-settings:'FILL'_1]">{icon}</span>
                </a>
              ))}
            </div>
          </div>
          <FooterColumn title="Perusahaan" links={["Tentang Kami", "Karir", "Blog"]} />
          <FooterColumn title="Bantuan" links={["Pusat Bantuan", "Hubungi Kami", "Cara Kerja"]} />
          <FooterColumn title="Legal" links={["Kebijakan Privasi", "Syarat & Ketentuan"]} />
        </div>
        <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-4 border-t border-outline-variant/30 pt-8 md:flex-row">
          <p className="text-sm text-on-surface-variant">© 2024 RescueFood. Empowering communities through sustainable food distribution.</p>
          <p className="flex items-center gap-1 text-sm text-on-surface-variant">
            Dibuat dengan
            <span className="material-symbols-outlined text-[16px] text-error [font-variation-settings:'FILL'_1]">favorite</span>
            untuk bumi
          </p>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-4 font-title-md text-title-md text-on-surface">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a className="inline-block text-on-surface-variant transition-all hover:translate-x-1 hover:text-primary" href="#">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
