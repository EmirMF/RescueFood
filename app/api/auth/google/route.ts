import { NextResponse } from "next/server";

/**
 * Google OAuth2 – initiate the authorization flow.
 * The client must have set GOOGLE_CLIENT_ID in the environment.
 * The callback is handled by /api/auth/google/callback.
 */
export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID env var." },
      { status: 500 },
    );
  }

  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
