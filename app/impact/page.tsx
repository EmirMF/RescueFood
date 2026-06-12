import { AppHeader } from "@/components/app-header";
import { ImpactReport } from "@/components/impact-report";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ImpactPage() {
  const currentUser = await getCurrentUser();
  const role = currentUser?.role ?? null;

  // ── Public data (all roles + guests) ─────────────────────────────────────
  const [merchantCount, completedOrdersPublic, topListings, recentCompleted] =
    await Promise.all([
      prisma.merchant.count({ where: { verificationStatus: "VERIFIED" } }),

      prisma.order.findMany({
        where: { status: "COMPLETED" },
        include: { listing: { select: { co2SavedGrams: true, title: true } } },
      }),

      prisma.foodListing.findMany({
        where: { merchant: { verificationStatus: "VERIFIED" } },
        include: { merchant: { select: { businessName: true } } },
        orderBy: { co2SavedGrams: "desc" },
        take: 10,
      }),

      prisma.order.findMany({
        where: { status: "COMPLETED", paymentStatus: "PAID" },
        include: { listing: { select: { title: true, co2SavedGrams: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  const mealsRescued = completedOrdersPublic.reduce((s, o) => s + o.quantity, 0);
  const co2SavedGrams = completedOrdersPublic.reduce((s, o) => s + (o.listing.co2SavedGrams ?? 0), 0);

  // ── Customer personal data ────────────────────────────────────────────────
  let customerData: {
    myMeals: number;
    myCo2Grams: number;
    moneySaved: number;
  } | null = null;

  if (role === "CUSTOMER" && currentUser) {
    const myOrders = await prisma.order.findMany({
      where: { customerId: currentUser.id, status: "COMPLETED" },
      include: {
        listing: { select: { co2SavedGrams: true, originalPrice: true } },
      },
    });
    customerData = {
      myMeals: myOrders.reduce((s, o) => s + o.quantity, 0),
      myCo2Grams: myOrders.reduce((s, o) => s + (o.listing.co2SavedGrams ?? 0), 0),
      moneySaved: myOrders.reduce(
        (s, o) => s + Math.max(0, o.listing.originalPrice * o.quantity - (o.totalPrice ?? 0)),
        0,
      ),
    };
  }

  // ── Merchant store data ───────────────────────────────────────────────────
  let merchantData: {
    storeOrders: number;
    storeMeals: number;
    storeCo2Grams: number;
    storeRevenue: number;
    topListing: { title: string; co2SavedGrams: number } | null;
  } | null = null;

  if (role === "MERCHANT" && currentUser?.merchantId) {
    const [storeOrders, storeBestListing] = await Promise.all([
      prisma.order.findMany({
        where: { merchantId: currentUser.merchantId, status: "COMPLETED" },
        include: { listing: { select: { co2SavedGrams: true } } },
      }),
      prisma.foodListing.findFirst({
        where: { merchantId: currentUser.merchantId },
        orderBy: { co2SavedGrams: "desc" },
        select: { title: true, co2SavedGrams: true },
      }),
    ]);
    merchantData = {
      storeOrders: storeOrders.length,
      storeMeals: storeOrders.reduce((s, o) => s + o.quantity, 0),
      storeCo2Grams: storeOrders.reduce((s, o) => s + (o.listing.co2SavedGrams ?? 0), 0),
      storeRevenue: storeOrders.reduce((s, o) => s + (o.totalPrice ?? 0), 0),
      topListing: storeBestListing,
    };
  }

  // ── Admin-only data ───────────────────────────────────────────────────────
  let adminData: {
    revenueGenerated: number;
    platformFeesCollected: number;
    activeSubscribers: number;
    todayAssignments: number;
    orderBreakdown: { status: string; count: number }[];
  } | null = null;

  if (role === "ADMIN") {
    const [allOrders, activeSubscribers, todayAssignments] = await Promise.all([
      prisma.order.findMany({ select: { status: true, totalPrice: true, isSubscriptionOrder: true, paymentStatus: true } }),
      prisma.user.count({ where: { subscriptionStatus: "active" } }),
      prisma.subscriptionAssignment.count({ where: { date: todayString() } }),
    ]);

    const paidOrders = allOrders.filter((o) => o.paymentStatus === "PAID" && !o.isSubscriptionOrder);
    const revenueGenerated = paidOrders.reduce((s, o) => s + (o.totalPrice ?? 0), 0);

    adminData = {
      revenueGenerated,
      platformFeesCollected: Math.round(revenueGenerated * 0.1),
      activeSubscribers,
      todayAssignments,
      orderBreakdown: [
        { status: "Selesai",    count: allOrders.filter((o) => o.status === "COMPLETED").length },
        { status: "Dikonfirmasi", count: allOrders.filter((o) => o.status === "CONFIRMED").length },
        { status: "Pending",    count: allOrders.filter((o) => o.status === "PENDING").length },
        { status: "Dibatalkan", count: allOrders.filter((o) => o.status === "CANCELLED" || o.status === "EXPIRED").length },
      ],
    };
  }

  return (
    <main className="min-h-screen bg-rf-background">
      <AppHeader active="impact" showSession actions={[{ href: "/marketplace", label: "Marketplace" }]} />

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary">
            Impact report
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-rf-text-onyx">
            Dampak makanan terselamatkan.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-rf-text-muted">
            {role === "ADMIN"
              ? "Full platform metrics — revenue, subscriber, dan breakdown operasional."
              : role === "MERCHANT"
                ? "Dampak platform + kontribusi toko kamu."
                : role === "CUSTOMER"
                  ? "Dampak platform + kontribusi personalmu."
                  : "Data real-time makanan terselamatkan dan CO2 yang dikurangi."}
          </p>
        </div>

        <ImpactReport
          role={role}
          mealsRescued={mealsRescued}
          co2SavedGrams={co2SavedGrams}
          merchantCount={merchantCount}
          topListings={topListings.map((l) => ({
            id: l.id,
            title: l.title,
            merchantName: l.merchant.businessName,
            co2SavedGrams: l.co2SavedGrams,
            quantity: l.quantity,
            status: l.status,
          }))}
          recentActivity={recentCompleted.map((o) => ({
            id: o.id,
            listingTitle: o.listing.title,
            co2SavedGrams: o.listing.co2SavedGrams ?? 0,
            createdAt: o.createdAt.toISOString(),
          }))}
          customerData={customerData}
          merchantData={merchantData}
          adminData={adminData}
        />
      </section>
    </main>
  );
}
