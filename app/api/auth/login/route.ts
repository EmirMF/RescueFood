import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { createSession } from "@/lib/auth";
import {
  clearRateLimit,
  getRateLimitStatus,
  rateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email || !body.password) {
    return fail("email and password are required");
  }

  // Rate limit only failed attempts, scoped per IP + email.
  // Successful logins reset the counter so switching demo accounts stays smooth.
  const clientId = getClientIdentifier(request);
  const email = String(body.email).trim().toLowerCase();
  const rateLimitKey = `login:${clientId}:${email}`;
  const rateLimitConfig = {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
  };

  const blockedResult = getRateLimitStatus(rateLimitKey, rateLimitConfig);

  if (!blockedResult.allowed) {
    const minutesLeft = Math.ceil((blockedResult.resetAt - Date.now()) / 60000);

    return NextResponse.json(
      { error: `Terlalu banyak percobaan login. Coba lagi dalam ${minutesLeft} menit.` },
      {
        status: 429,
        headers: getRateLimitHeaders(blockedResult),
      }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const failedResult = rateLimit(rateLimitKey, rateLimitConfig);
    // Generic error message to prevent email enumeration
    return fail("Email atau password salah", 401, getRateLimitHeaders(failedResult));
  }

  const passwordMatches = await bcrypt.compare(body.password, user.passwordHash);

  if (!passwordMatches) {
    const failedResult = rateLimit(rateLimitKey, rateLimitConfig);
    // Generic error message to prevent email enumeration
    return fail("Email atau password salah", 401, getRateLimitHeaders(failedResult));
  }

  // Check if account is suspended
  if (user.status === "SUSPENDED") {
    return fail("Akun Anda telah ditangguhkan. Hubungi admin untuk informasi lebih lanjut.", 403);
  }

  if (user.role === "MERCHANT") {
    const merchant = await prisma.merchant.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!merchant) {
      await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: user.name,
          address: "Alamat belum diatur",
          phone: "-",
          verificationStatus: "PENDING",
        },
      });
    }
  }

  await createSession(user.id);
  clearRateLimit(rateLimitKey);

  const response = ok({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  return response;
}
