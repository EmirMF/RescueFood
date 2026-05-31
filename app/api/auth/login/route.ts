import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { createSession } from "@/lib/auth";
import { rateLimit, getClientIdentifier, getRateLimitHeaders } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Rate limiting: 5 attempts per 15 minutes per IP
  const clientId = getClientIdentifier(request);
  const rateLimitResult = rateLimit(`login:${clientId}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  });

  if (!rateLimitResult.allowed) {
    const minutesLeft = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
    
    return NextResponse.json(
      { error: `Terlalu banyak percobaan login. Coba lagi dalam ${minutesLeft} menit.` },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const body = await request.json();

  if (!body.email || !body.password) {
    return fail("email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    // Generic error message to prevent email enumeration
    return fail("Email atau password salah", 401);
  }

  const passwordMatches = await bcrypt.compare(body.password, user.passwordHash);

  if (!passwordMatches) {
    // Generic error message to prevent email enumeration
    return fail("Email atau password salah", 401);
  }

  // Check if account is suspended
  if (user.status === "SUSPENDED") {
    return fail("Akun Anda telah ditangguhkan. Hubungi admin untuk informasi lebih lanjut.", 403);
  }

  await createSession(user.id);

  const response = ok({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  // Add rate limit headers to successful response
  const headers = getRateLimitHeaders(rateLimitResult);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
