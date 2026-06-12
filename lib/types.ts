export type UserRole = "customer" | "merchant" | "charity" | "admin";

export type ListingType = "sale" | "donation";

export type ListingStatus =
  | "active"
  | "reserved"
  | "sold_out"
  | "expired"
  | "removed";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type ClaimStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export type FoodCategory =
  | "bakery"
  | "rice_meal"
  | "vegetarian"
  | "beverage"
  | "snack"
  | "produce";

export type Merchant = {
  id: string;
  name: string;
  category: string;
  location: string;
  distanceKm: number;
  rating: number;
  verified: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type FoodListing = {
  id: string;
  title: string;
  description: string;
  merchantId: string;
  merchantName?: string;
  merchantLocation?: string;
  merchantDistanceKm?: number;
  merchantRating?: number;
  merchantVerified?: boolean;
  category: FoodCategory;
  type: ListingType;
  status: ListingStatus;
  originalPrice: number;
  rescuePrice: number;
  floorPrice?: number;
  currentPrice?: number;
  platformFee?: number;
  allergenTags?: string[];
  co2SavedGrams?: number;
  quantity: number;
  pickupWindow: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  consumeBefore: string;
  imageUrl: string;
  impactKgCo2: number;
  tags: string[];
};

export type RescueOrder = {
  id: string;
  listingId: string;
  customerName: string;
  quantity: number;
  adminFee?: number;
  totalPrice?: number;
  status: OrderStatus;
  pickupCode: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
};

export type DonationClaim = {
  id: string;
  listingId: string;
  organizationName: string;
  pickupCode?: string;
  quantity: number;
  status: ClaimStatus;
  createdAt: string;
};

export type ImpactStats = {
  mealsRescued: number;
  foodSavedKg: number;
  co2SavedKg: number;
  partnerMerchants: number;
};
