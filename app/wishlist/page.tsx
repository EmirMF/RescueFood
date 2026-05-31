import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { WishlistContent } from "@/components/wishlist-content";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth");
  }

  if (currentUser.role !== "CUSTOMER") {
    redirect("/profile");
  }

  return (
    <main className="min-h-screen bg-rf-surface">
      <AppHeader active="wishlist" showSession />
      <WishlistContent />
    </main>
  );
}
