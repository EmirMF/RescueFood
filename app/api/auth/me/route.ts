import { getCurrentUser } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getCurrentUser());
}
