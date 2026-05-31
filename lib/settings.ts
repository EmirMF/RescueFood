import { prisma } from "@/lib/prisma";

export const ADMIN_FEE_SETTING_KEY = "ADMIN_FEE_FLAT";

export async function getAdminFee() {
  const setting = await prisma.appSetting.findUnique({
    where: {
      key: ADMIN_FEE_SETTING_KEY,
    },
  });
  const value = Number(setting?.value ?? 0);

  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

export async function setAdminFee(value: number) {
  const normalizedValue = Math.max(0, Math.round(value));

  return prisma.appSetting.upsert({
    where: {
      key: ADMIN_FEE_SETTING_KEY,
    },
    create: {
      key: ADMIN_FEE_SETTING_KEY,
      value: String(normalizedValue),
    },
    update: {
      value: String(normalizedValue),
    },
  });
}
