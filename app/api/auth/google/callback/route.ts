import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authCookieName } from "@/lib/auth";
import { createHmac } from "crypto";

// ── helpers (harus sama persis dengan lib/auth.ts) ──────────────────────────
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

// ── types ────────────────────────────────────────────────────────────────────
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

// ── route ────────────────────────────────────────────────────────────────────
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
      return NextResponse.redirect(
        `${origin}/auth?error=google_userinfo_failed`,
      );
    }

    const googleUser: GoogleUserInfo = await userInfoRes.json();

    if (!googleUser.email_verified) {
      return NextResponse.redirect(
        `${origin}/auth?error=google_email_unverified`,
      );
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
          passwordHash: "", // OAuth users have no password
          role: "CUSTOMER",
          status: "ACTIVE",
        },
        select: { id: true, role: true, status: true },
      });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.redirect(`${origin}/auth?error=account_suspended`);
    }

    // 4. Build the session cookie value
    const sessionValue = encodeSession(user.id);
    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24 * 7; // 7 days

    // 5. Determine destination
    const redirectMap: Record<string, string> = {
      MERCHANT: "/merchant",
      ADMIN: "/admin/dashboard",
      CUSTOMER: "/marketplace",
      CHARITY: "/marketplace",
    };
    const destination = redirectMap[user.role] ?? "/marketplace";

    // 6. Build redirect response and SET COOKIE directly on it
    //    (avoids the cookies() API which can drop Set-Cookie on redirects)
    const response = NextResponse.redirect(`${origin}${destination}`);
    response.cookies.set(authCookieName, sessionValue, {
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
      path: "/",
      maxAge,
    });

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/auth?error=oauth_error`);
  }
}