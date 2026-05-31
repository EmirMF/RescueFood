import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Use __Host- prefix only in production (requires HTTPS)
// In development, use regular name since localhost is HTTP
export const authCookieName = 
  process.env.NODE_ENV === "production" 
    ? "__Host-rescuefood_session" 
    : "rescuefood_session";

const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "MERCHANT" | "CHARITY" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  merchantId?: string;
  charityId?: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  
  // Fail in production if secret is not set
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

function decodeSession(value?: string) {
  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");

  if (!userId || !signature) {
    return null;
  }

  const expected = sign(userId);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  return userId;
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(authCookieName, encodeSession(userId), {
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax", // strict in production, lax in dev
    secure: isProduction, // Only secure in production
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(authCookieName);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const userId = decodeSession(cookieStore.get(authCookieName)?.value);

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      merchant: {
        select: {
          id: true,
        },
      },
      charity: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    merchantId: user.merchant?.id,
    charityId: user.charity?.id,
  };
}
