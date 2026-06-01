import { authCookieName, clearSession } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();

  const response = ok({ loggedOut: true });
  const isProduction = process.env.NODE_ENV === "production";
  const cookieNames = new Set([authCookieName, "rescuefood_session"]);

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}
