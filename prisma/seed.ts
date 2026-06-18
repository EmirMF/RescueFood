import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";

const ADMIN_FEE_SETTING_KEY = "ADMIN_FEE_FLAT";
const ADMIN_FEE = 2500;
let prisma: PrismaClient | undefined;

function loadEnvFile() {
  if (!existsSync(".env")) {
    return;
  }

  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);

    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
}

function subtotal(price: number, quantity: number) {
  return price * quantity;
}

function total(price: number, quantity: number) {
  return subtotal(price, quantity) + ADMIN_FEE;
}

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

async function main() {
  loadEnvFile();
  ({ prisma } = await import("../lib/prisma"));

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.donationClaim.deleteMany();
  await prisma.order.deleteMany();
  await prisma.foodListing.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.charity.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();

  await prisma.appSetting.create({
    data: {
      key: ADMIN_FEE_SETTING_KEY,
      value: String(ADMIN_FEE),
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "RescueFood Admin",
      email: "admin@rescuefood.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  const nadia = await prisma.user.create({
    data: {
      name: "Nadia Putri",
      email: "customer@rescuefood.local",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const budi = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@rescuefood.local",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const siti = await prisma.user.create({
    data: {
      name: "Siti Rahayu",
      email: "siti@rescuefood.local",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const greenOvenUser = await prisma.user.create({
    data: {
      name: "Green Oven Bakery",
      email: "merchant@rescuefood.local",
      passwordHash,
      role: "MERCHANT",
    },
  });

  const rasaKantinUser = await prisma.user.create({
    data: {
      name: "Rasa Kantin Bandung",
      email: "rasa@rescuefood.local",
      passwordHash,
      role: "MERCHANT",
    },
  });

  const pendingMerchantUser = await prisma.user.create({
    data: {
      name: "Kopi Senja",
      email: "pending-merchant@rescuefood.local",
      passwordHash,
      role: "MERCHANT",
    },
  });

  const rejectedMerchantUser = await prisma.user.create({
    data: {
      name: "Dapur Lama",
      email: "rejected-merchant@rescuefood.local",
      passwordHash,
      role: "MERCHANT",
    },
  });

  const charityUser = await prisma.user.create({
    data: {
      name: "Komunitas Berbagi Bandung",
      email: "charity@rescuefood.local",
      passwordHash,
      role: "CHARITY",
    },
  });

  const greenOven = await prisma.merchant.create({
    data: {
      userId: greenOvenUser.id,
      businessName: "Green Oven Bakery",
      address: "Jl. Ir. H. Juanda No. 153, Dago, Bandung",
      latitude: -6.885602,
      longitude: 107.613716,
      phone: "+6281234567890",
      verificationStatus: "VERIFIED",
      averageRating: 0,
    },
  });

  const rasaKantin = await prisma.merchant.create({
    data: {
      userId: rasaKantinUser.id,
      businessName: "Rasa Kantin Bandung",
      address: "Jl. Dipati Ukur No. 35, Coblong, Bandung",
      latitude: -6.889797,
      longitude: 107.617737,
      phone: "+6282211122233",
      verificationStatus: "VERIFIED",
      averageRating: 0,
    },
  });

  await prisma.merchant.create({
    data: {
      userId: pendingMerchantUser.id,
      businessName: "Kopi Senja",
      address: "Jl. Trunojoyo No. 18, Bandung",
      latitude: -6.90394,
      longitude: 107.610138,
      phone: "+6281333344455",
      verificationStatus: "PENDING",
    },
  });

  await prisma.merchant.create({
    data: {
      userId: rejectedMerchantUser.id,
      businessName: "Dapur Lama",
      address: "Jl. Cihampelas No. 90, Bandung",
      latitude: -6.893481,
      longitude: 107.604512,
      phone: "+6281555566677",
      verificationStatus: "REJECTED",
    },
  });

  const charity = await prisma.charity.create({
    data: {
      userId: charityUser.id,
      organizationName: "Komunitas Berbagi Bandung",
      address: "Coblong, Bandung",
      verificationStatus: "VERIFIED",
    },
  });

  // ── Listings Green Oven Bakery ────────────────────────────────────────────
  const sourdoughBox = await prisma.foodListing.create({
    data: {
      merchantId: greenOven.id,
      title: "Sourdough & Pastry Rescue Box",
      description: "Paket roti sourdough, croissant, dan pastry dari batch sore. Cocok untuk sarapan keluarga atau sharing.",
      category: "bakery",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
      originalPrice: 85000,
      discountedPrice: 42000,
      floorPrice: 20000,
      allergenTags: ["Gluten", "Dairy", "Egg"],
      allergenInfo: "Contains gluten, dairy, and egg.",
      quantity: 8,
      mode: "SALE",
      pickupLocation: greenOven.address,
      pickupLatitude: greenOven.latitude,
      pickupLongitude: greenOven.longitude,
      pickupStartTime: hoursFromNow(-0.5),
      pickupEndTime: hoursFromNow(7),
      consumeBefore: hoursFromNow(24),
      impactKgCo2: 12,
      co2SavedGrams: 12000,
      status: "ACTIVE",
    },
  });

  await prisma.foodListing.create({
    data: {
      merchantId: greenOven.id,
      title: "Mini Cake & Cookie Box",
      description: "Assorted mini cake dan cookies dari batch harian. Manis, lembut, cocok untuk cemilan sore.",
      category: "bakery",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
      originalPrice: 65000,
      discountedPrice: 32000,
      floorPrice: 15000,
      allergenTags: ["Gluten", "Dairy", "Egg"],
      allergenInfo: "Contains gluten, dairy, and egg.",
      quantity: 6,
      mode: "SALE",
      pickupLocation: greenOven.address,
      pickupLatitude: greenOven.latitude,
      pickupLongitude: greenOven.longitude,
      pickupStartTime: hoursFromNow(-1),
      pickupEndTime: hoursFromNow(5),
      consumeBefore: hoursFromNow(20),
      impactKgCo2: 8,
      co2SavedGrams: 8000,
      status: "ACTIVE",
    },
  });

  await prisma.foodListing.create({
    data: {
      merchantId: greenOven.id,
      title: "Roti Sisir & Roti Unyil",
      description: "Roti sisir mentega dan roti unyil berbagai rasa dari produksi pagi. Masih empuk dan harum.",
      category: "bakery",
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
      originalPrice: 35000,
      discountedPrice: 18000,
      floorPrice: 10000,
      allergenTags: ["Gluten", "Dairy"],
      allergenInfo: "Contains gluten and dairy.",
      quantity: 12,
      mode: "SALE",
      pickupLocation: greenOven.address,
      pickupLatitude: greenOven.latitude,
      pickupLongitude: greenOven.longitude,
      pickupStartTime: hoursFromNow(-2),
      pickupEndTime: hoursFromNow(6),
      consumeBefore: hoursFromNow(18),
      impactKgCo2: 6,
      co2SavedGrams: 6200,
      status: "ACTIVE",
    },
  });

  // ── Listings Rasa Kantin ──────────────────────────────────────────────────
  const riceBowl = await prisma.foodListing.create({
    data: {
      merchantId: rasaKantin.id,
      title: "Rice Bowl Ayam Jamur",
      description: "Rice bowl matang dari lunch service. Porsi lengkap dengan ayam jamur, sayur, dan sambal terpisah.",
      category: "rice_meal",
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
      originalPrice: 38000,
      discountedPrice: 19000,
      floorPrice: 10000,
      allergenTags: ["Soy"],
      allergenInfo: "Contains soy and garlic.",
      quantity: 15,
      mode: "SALE",
      pickupLocation: rasaKantin.address,
      pickupLatitude: rasaKantin.latitude,
      pickupLongitude: rasaKantin.longitude,
      pickupStartTime: hoursFromNow(-1),
      pickupEndTime: hoursFromNow(6),
      consumeBefore: hoursFromNow(10),
      impactKgCo2: 24,
      co2SavedGrams: 24000,
      status: "ACTIVE",
    },
  });

  const producePack = await prisma.foodListing.create({
    data: {
      merchantId: rasaKantin.id,
      title: "Fresh Produce Pack",
      description: "Paket sayur dan buah layak konsumsi dari prep dapur harian. Baik untuk dimasak di hari yang sama.",
      category: "produce",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
      originalPrice: 45000,
      discountedPrice: 22000,
      floorPrice: 12000,
      allergenTags: [],
      allergenInfo: "No common allergens.",
      quantity: 10,
      mode: "SALE",
      pickupLocation: rasaKantin.address,
      pickupLatitude: rasaKantin.latitude,
      pickupLongitude: rasaKantin.longitude,
      pickupStartTime: hoursFromNow(-0.5),
      pickupEndTime: hoursFromNow(7.5),
      consumeBefore: hoursFromNow(24),
      impactKgCo2: 18,
      co2SavedGrams: 18000,
      status: "ACTIVE",
    },
  });

  await prisma.foodListing.create({
    data: {
      merchantId: rasaKantin.id,
      title: "Nasi Ayam Bakar 1/2 Ekor",
      description: "Nasi ayam bakar khas Bandung. Disajikan dengan lalapan, sambal, dan kuah kaldu. Sisa makan siang.",
      category: "rice_meal",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
      originalPrice: 45000,
      discountedPrice: 22000,
      floorPrice: 12000,
      allergenTags: [],
      allergenInfo: "No common allergens.",
      quantity: 10,
      mode: "SALE",
      pickupLocation: rasaKantin.address,
      pickupLatitude: rasaKantin.latitude,
      pickupLongitude: rasaKantin.longitude,
      pickupStartTime: hoursFromNow(-1),
      pickupEndTime: hoursFromNow(5),
      consumeBefore: hoursFromNow(9),
      impactKgCo2: 20,
      co2SavedGrams: 20000,
      status: "ACTIVE",
    },
  });

  await prisma.foodListing.create({
    data: {
      merchantId: rasaKantin.id,
      title: "Nasi Goreng Sapi Special",
      description: "Nasi goreng sapi dengan telur dan acar. Sisa dari catering siang, masih panas dan lezat.",
      category: "rice_meal",
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
      originalPrice: 40000,
      discountedPrice: 20000,
      floorPrice: 10000,
      allergenTags: ["Egg", "Soy"],
      allergenInfo: "Contains egg and soy.",
      quantity: 8,
      mode: "SALE",
      pickupLocation: rasaKantin.address,
      pickupLatitude: rasaKantin.latitude,
      pickupLongitude: rasaKantin.longitude,
      pickupStartTime: hoursFromNow(-2),
      pickupEndTime: hoursFromNow(4),
      consumeBefore: hoursFromNow(8),
      impactKgCo2: 18,
      co2SavedGrams: 18500,
      status: "ACTIVE",
    },
  });

  await prisma.foodListing.create({
    data: {
      merchantId: rasaKantin.id,
      title: "Paket Snack Sehat",
      description: "Kumpulan snack sehat: granola bar, energy ball, dan buah potong. Sisa dari event kantor.",
      category: "snack",
      imageUrl: "https://images.unsplash.com/photo-1499195333224-3ce974eecb47?auto=format&fit=crop&w=900&q=80",
      originalPrice: 28000,
      discountedPrice: 14000,
      floorPrice: 7000,
      allergenTags: ["Gluten", "Peanut"],
      allergenInfo: "Contains gluten and peanut.",
      quantity: 20,
      mode: "SALE",
      pickupLocation: rasaKantin.address,
      pickupLatitude: rasaKantin.latitude,
      pickupLongitude: rasaKantin.longitude,
      pickupStartTime: hoursFromNow(-1),
      pickupEndTime: hoursFromNow(6),
      consumeBefore: hoursFromNow(48),
      impactKgCo2: 5,
      co2SavedGrams: 5400,
      status: "ACTIVE",
    },
  });

  // ── Donation listing ──────────────────────────────────────────────────────
  const donationListing = await prisma.foodListing.create({
    data: {
      merchantId: rasaKantin.id,
      title: "Nasi Box Donasi Komunitas",
      description: "Nasi box matang dari event kampus. Tersedia untuk donasi komunitas.",
      category: "rice_meal",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
      originalPrice: 30000,
      discountedPrice: 0,
      floorPrice: 0,
      allergenTags: [],
      allergenInfo: "Ask merchant for allergen details.",
      quantity: 24,
      mode: "DONATION",
      pickupLocation: rasaKantin.address,
      pickupLatitude: rasaKantin.latitude,
      pickupLongitude: rasaKantin.longitude,
      pickupStartTime: hoursFromNow(-1),
      pickupEndTime: hoursFromNow(3),
      consumeBefore: hoursFromNow(7),
      impactKgCo2: 35,
      co2SavedGrams: 35000,
      status: "ACTIVE",
    },
  });

  const orderReady = await prisma.order.create({
    data: {
      customerId: nadia.id,
      listingId: sourdoughBox.id,
      merchantId: greenOven.id,
      quantity: 1,
      adminFee: ADMIN_FEE,
      totalPrice: total(42000, 1),
      status: "READY_FOR_PICKUP",
      pickupCode: "RF-4821",
      paymentStatus: "PAID",
      paymentMethod: "qris",
      midtransOrderId: "RF-SEED-4821",
      paidAt: new Date(),
    },
  });

  const orderCompleted1 = await prisma.order.create({
    data: {
      customerId: budi.id,
      listingId: sourdoughBox.id,
      merchantId: greenOven.id,
      quantity: 2,
      adminFee: ADMIN_FEE,
      totalPrice: total(42000, 2),
      status: "COMPLETED",
      pickupCode: "RF-4822",
      paymentStatus: "PAID",
      paymentMethod: "bank_transfer",
      midtransOrderId: "RF-SEED-4822",
      paidAt: new Date(),
    },
  });

  const orderCompleted2 = await prisma.order.create({
    data: {
      customerId: siti.id,
      listingId: riceBowl.id,
      merchantId: rasaKantin.id,
      quantity: 3,
      adminFee: ADMIN_FEE,
      totalPrice: total(19000, 3),
      status: "COMPLETED",
      pickupCode: "RF-4823",
      paymentStatus: "PAID",
      paymentMethod: "qris",
      midtransOrderId: "RF-SEED-4823",
      paidAt: new Date(),
    },
  });

  const orderPendingPayment = await prisma.order.create({
    data: {
      customerId: nadia.id,
      listingId: producePack.id,
      merchantId: rasaKantin.id,
      quantity: 1,
      adminFee: ADMIN_FEE,
      totalPrice: total(22000, 1),
      status: "PENDING",
      pickupCode: "RF-4824",
      paymentStatus: "PENDING",
      midtransOrderId: "RF-SEED-4824",
    },
  });

  await prisma.review.createMany({
    data: [
      {
        orderId: orderCompleted1.id,
        customerId: budi.id,
        merchantId: greenOven.id,
        rating: 5,
        comment:
          "Roti dan pastry-nya fresh. Pickup cepat dan staff-nya ramah.",
      },
      {
        orderId: orderCompleted2.id,
        customerId: siti.id,
        merchantId: rasaKantin.id,
        rating: 4,
        comment:
          "Rice bowl masih enak dan porsinya pas. Senang bisa bantu mengurangi food waste.",
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        orderId: orderReady.id,
        senderId: nadia.id,
        content: "Halo, saya akan pickup sekitar jam 11.30 ya.",
      },
      {
        orderId: orderReady.id,
        senderId: greenOvenUser.id,
        content: "Siap, pesanan sudah kami siapkan di kasir depan.",
      },
      {
        orderId: orderPendingPayment.id,
        senderId: nadia.id,
        content: "Apakah produce pack bisa diambil lebih cepat?",
      },
      {
        orderId: orderPendingPayment.id,
        senderId: rasaKantinUser.id,
        content: "Bisa, mulai jam 10.00 sudah tersedia.",
      },
    ],
  });

  await prisma.wishlist.createMany({
    data: [
      { userId: nadia.id, listingId: sourdoughBox.id },
      { userId: nadia.id, listingId: riceBowl.id },
      { userId: budi.id, listingId: producePack.id },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: "MERCHANT_VERIFIED",
        title: "Seed database ready",
        message: "Demo users, merchants, listings, orders, and admin fee are available.",
        read: false,
        actionUrl: "/admin/verification",
      },
      {
        userId: greenOvenUser.id,
        type: "NEW_ORDER",
        title: "Order ready for pickup",
        message: "Nadia Putri has a paid pickup order waiting.",
        read: false,
        actionUrl: `/merchant/orders/${orderReady.id}`,
      },
      {
        userId: nadia.id,
        type: "ORDER_READY",
        title: "Pickup ready",
        message: "Green Oven Bakery has marked your order ready for pickup.",
        read: false,
        actionUrl: `/orders/${orderReady.id}`,
      },
    ],
  });

  await prisma.donationClaim.create({
    data: {
      charityId: charity.id,
      listingId: donationListing.id,
      merchantId: rasaKantin.id,
      quantity: 12,
      status: "APPROVED",
      pickupCode: "DC-2148",
    },
  });

  for (const merchant of [greenOven, rasaKantin]) {
    const reviews = await prisma.review.findMany({
      where: { merchantId: merchant.id },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { averageRating },
    });
  }
}

main()
  .then(async () => {
    await prisma?.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma?.$disconnect();
    process.exit(1);
  });
