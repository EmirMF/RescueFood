export type VerificationTarget = {
  id: string;
  name: string;
  type: "merchant" | "charity";
  location: string;
  submittedAt: string;
  notes: string;
  status?: "pending" | "approved" | "rejected";
};

export const verificationTargets: VerificationTarget[] = [
  {
    id: "verify-merchant-green-bakery",
    name: "Green Oven Bakery",
    type: "merchant",
    location: "Dago, Bandung",
    submittedAt: "2026-05-30T08:30:00.000Z",
    notes: "Business license and kitchen photos submitted.",
  },
  {
    id: "verify-charity-berbagi",
    name: "Komunitas Berbagi Bandung",
    type: "charity",
    location: "Coblong, Bandung",
    submittedAt: "2026-05-30T09:00:00.000Z",
    notes: "Community distribution history submitted.",
  },
  {
    id: "verify-merchant-sayur-sore",
    name: "Sayur Sore",
    type: "merchant",
    location: "Cihampelas, Bandung",
    submittedAt: "2026-05-30T09:45:00.000Z",
    notes: "Needs address confirmation before publishing listings.",
  },
];
