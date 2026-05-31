import type { FoodListing } from "@/lib/types";

type ApiListing = {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  mode: "SALE" | "DONATION";
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  pickupStartTime: string | Date;
  pickupEndTime: string | Date;
  consumeBefore: string | Date;
  impactKgCo2: number;
  status: string;
  merchant?: {
    businessName: string;
    address: string;
    averageRating: number;
    verificationStatus: string;
  };
};

function formatWindow(start: string | Date, end: string | Date) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${startDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })}, ${startDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}-${endDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatConsumeBefore(value: string | Date) {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapApiListingToFoodListing(listing: ApiListing): FoodListing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    merchantId: listing.merchantId,
    merchantName: listing.merchant?.businessName,
    merchantLocation: listing.merchant?.address,
    merchantDistanceKm: 0,
    merchantRating: listing.merchant?.averageRating,
    merchantVerified: listing.merchant?.verificationStatus === "VERIFIED",
    category:
      listing.category === "rice_meal" ||
      listing.category === "bakery" ||
      listing.category === "produce" ||
      listing.category === "vegetarian" ||
      listing.category === "snack" ||
      listing.category === "beverage"
        ? listing.category
        : "snack",
    type: listing.mode === "DONATION" ? "donation" : "sale",
    status:
      listing.status === "SOLD_OUT"
        ? "sold_out"
        : listing.status === "EXPIRED"
          ? "expired"
          : listing.status === "REMOVED"
            ? "removed"
            : "active",
    originalPrice: listing.originalPrice,
    rescuePrice: listing.discountedPrice,
    quantity: listing.quantity,
    pickupWindow: formatWindow(listing.pickupStartTime, listing.pickupEndTime),
    pickupLatitude: listing.pickupLatitude ?? null,
    pickupLongitude: listing.pickupLongitude ?? null,
    consumeBefore: formatConsumeBefore(listing.consumeBefore),
    imageUrl: listing.imageUrl,
    impactKgCo2: listing.impactKgCo2,
    tags: listing.mode === "DONATION" ? ["Donasi"] : ["Backend"],
  };
}
