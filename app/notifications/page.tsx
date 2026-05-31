import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { NotificationsContent } from "@/components/notifications-content";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-rf-surface">
      <AppHeader active="notifications" showSession />
      <NotificationsContent />
    </main>
  );
}
