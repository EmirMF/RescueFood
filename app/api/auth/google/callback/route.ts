import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

// ── Session helpers — identik dengan lib/auth.ts ─────────────────────────────
const cookieName =
  process.env.NODE_ENV === "production"
    ? "__Host-rescuefood_session"
    : "rescuefood_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("AUTH_SECRET environment variable must be set in production");
  }
  return secret ?? "rescuefood-local-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodeSession(userId: string) {
  return `${userId}.${sign(userId)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  picture?: string;
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/auth?error=google_denied`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/auth?error=google_not_configured`);
  }

  try {
    // 1. Exchange code → tokens
    const redirectUri = `${origin}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens: GoogleTokenResponse = await tokenRes.json();
    if (!tokenRes.ok || tokens.error) {
      console.error("Google token exchange failed:", tokens);
      return NextResponse.redirect(`${origin}/auth?error=google_token_failed`);
    }

    // 2. Get user info
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${origin}/auth?error=google_userinfo_failed`);
    }

    const googleUser: GoogleUserInfo = await userInfoRes.json();

    if (!googleUser.email_verified) {
      return NextResponse.redirect(`${origin}/auth?error=google_email_unverified`);
    }

    // 3. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          passwordHash: "",
          role: "CUSTOMER",
          status: "ACTIVE",
        },
        select: { id: true, role: true, status: true },
      });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.redirect(`${origin}/auth?error=account_suspended`);
    }

    // 4. Build session value
    const sessionValue = encodeSession(user.id);
    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24 * 7; // 7 days

    // 5. Destination after login
    const redirectMap: Record<string, string> = {
      MERCHANT: "/merchant",
      ADMIN: "/admin/dashboard",
      CUSTOMER: "/marketplace",
      CHARITY: "/marketplace",
    };
    const destination = redirectMap[user.role] ?? "/marketplace";

    // 6. Set cookie via raw Set-Cookie header — paling reliable di semua
    //    versi Next.js, menghindari masalah dengan __Host- prefix dan redirect.
    //
    //    __Host- prefix rules: Secure; Path=/; NO Domain attribute.
    //    Kita build string manual untuk kontrol penuh.
    const cookieParts = [
      `${cookieName}=${sessionValue}`,
      `Path=/`,
      `Max-Age=${maxAge}`,
      `HttpOnly`,
      `SameSite=${isProduction ? "Strict" : "Lax"}`,
    ];
    // __Host- prefix wajib Secure, dan tidak boleh ada Domain attribute
    if (isProduction) {
      cookieParts.push("Secure");
    }

    const response = NextResponse.redirect(`${origin}${destination}`);
    response.headers.set("Set-Cookie", cookieParts.join("; "));

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/auth?error=oauth_error`);
  }
}
