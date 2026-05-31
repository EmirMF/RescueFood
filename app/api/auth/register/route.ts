import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api-response";
import { createSession } from "@/lib/auth";
import { validatePassword } from "@/lib/password-validation";
import { rateLimit, getClientIdentifier, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limiting: 3 registrations per hour per IP
  const clientId = getClientIdentifier(request);
  const rateLimitResult = rateLimit(`register:${clientId}`, {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  });

  if (!rateLimitResult.allowed) {
    const minutesLeft = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
    
    return NextResponse.json(
      { error: `Terlalu banyak percobaan registrasi. Coba lagi dalam ${minutesLeft} menit.` },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const body = await request.json();

  if (!body.name || !body.email || !body.password || !body.role) {
    return fail("name, email, password, and role are required");
  }

  // Validate password
  const passwordValidation = validatePassword(body.password);
  if (!passwordValidation.valid) {
    return fail(passwordValidation.errors.join(", "), 400);
  }

  const role = String(body.role).toUpperCase();

  if (!["CUSTOMER", "MERCHANT", "CHARITY"].includes(role)) {
    return fail("role must be CUSTOMER, MERCHANT, or CHARITY");
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    return fail("Email sudah terdaftar", 409);
  }

  const passwordHash = await bcrypt.hash(body.password, 12); // Increased from 10 to 12
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      role: role as "CUSTOMER" | "MERCHANT" | "CHARITY",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  await createSession(user.id);

  const response = ok(user, { status: 201 });

  // Add rate limit headers
  const headers = getRateLimitHeaders(rateLimitResult);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
