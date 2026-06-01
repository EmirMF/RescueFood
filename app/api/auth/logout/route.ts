import { clearSession } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  return ok({ loggedOut: true });
}
