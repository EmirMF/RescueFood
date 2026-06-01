import { AppHeader } from "@/components/app-header";
import { AdminDashboard } from "@/components/admin-dashboard";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [
    totalUsers,
    totalMerchants,
    pendingMerchants,
    verifiedMerchants,
    rejectedMerchants,
    totalListings,
    activeListings,
    totalOrders,
    completedOrders,
    cancelledOrders,
    pendingOrders,
    totalDonationClaims,
    completedDonationClaims,
    recentOrders,
    allUsers,
    topMerchants,
    foodSavedStats,
    allListings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.merchant.count(),
    prisma.merchant.count({ where: { verificationStatus: "PENDING" } }),
    prisma.merchant.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.merchant.count({ where: { verificationStatus: "REJECTED" } }),
    prisma.foodListing.count(),
    prisma.foodListing.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.donationClaim.count(),
    prisma.donationClaim.count({ where: { status: "COMPLETED" } }),
    // Recent orders
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        listing: { select: { title: true } },
        merchant: { select: { businessName: true } },
      },
    }),
    // All users (for moderation)
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    // Top merchants
    prisma.merchant.findMany({
      take: 5,
      where: { verificationStatus: "VERIFIED" },
      orderBy: { averageRating: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        _count: {
          select: {
            orders: { where: { status: "COMPLETED" } },
            listings: { where: { status: "ACTIVE" } },
          },
        },
      },
    }),
    // Food saved
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { quantity: true, totalPrice: true },
    }),
    // All listings for moderation
    prisma.foodListing.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        merchant: {
          select: {
            businessName: true,
            verificationStatus: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    }),
  ]);

  const foodSavedKg = Math.round((foodSavedStats._sum.quantity ?? 0) * 0.5);
  const totalRevenue = foodSavedStats._sum.totalPrice ?? 0;

  const dashboardData = {
    stats: {
      totalUsers,
      totalMerchants,
      pendingMerchants,
      verifiedMerchants,
      rejectedMerchants,
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      totalDonationClaims,
      completedDonationClaims,
      foodSavedKg,
      totalRevenue,
    },
    recentOrders: recentOrders.map((o: typeof recentOrders[number]) => ({
      id: o.id,
      customerName: o.customer.name,
      customerEmail: o.customer.email,
      listingTitle: o.listing.title,
      merchantName: o.merchant.businessName,
      quantity: o.quantity,
      totalPrice: o.totalPrice,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
    })),
    allUsers: allUsers.map((u: typeof allUsers[number]) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
    })),
    topMerchants: topMerchants.map((m: typeof topMerchants[number]) => ({
      id: m.id,
      businessName: m.businessName,
      ownerName: m.user.name,
      address: m.address,
      averageRating: m.averageRating,
      completedOrders: m._count.orders,
      activeListings: m._count.listings,
      verificationStatus: m.verificationStatus,
    })),
    allListings: allListings.map((l: typeof allListings[number]) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      merchantName: l.merchant.businessName,
      merchantVerified: l.merchant.verificationStatus === "VERIFIED",
      mode: l.mode,
      status: l.status,
      originalPrice: l.originalPrice,
      discountedPrice: l.discountedPrice,
      quantity: l.quantity,
      orderCount: l._count.orders,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader
        active="admin-dashboard"
        actions={[{ href: "/profile", label: "Profil" }]}
        showSession
      />
      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <AdminDashboard data={dashboardData} />
      </section>
    </main>
  );
}
