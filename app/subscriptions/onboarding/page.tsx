import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { SubscriptionOnboarding } from "@/components/subscription-onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/auth");

  const { payment } = await searchParams;

  return (
    <main className="min-h-screen bg-rf-background">
      <AppHeader showSession />
      <div className="mx-auto max-w-2xl px-5 py-16 md:px-8">
        <SubscriptionOnboarding paymentStatus={payment ?? "finish"} />
      </div>
    </main>
  );
}
