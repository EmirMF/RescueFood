import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

type AppRole = CurrentUser["role"];

export async function requireRole(role: AppRole) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth");
  }

  if (currentUser.role !== role) {
    redirect("/profile");
  }

  return currentUser;
}
