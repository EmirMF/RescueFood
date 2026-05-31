import { getCurrentUser } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export async function GET() {
  return ok(await getCurrentUser());
}
