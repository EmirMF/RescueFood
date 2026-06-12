export type PricingResult = {
  currentPrice: number;
  platformFee: number;
};

export function calculateDynamicPrice(
  originalPrice: number,
  floorPrice: number,
  pickupStartTime: Date,
  pickupEndTime: Date,
  viewCount: number = 0,
): PricingResult {
  const now = Date.now();
  const start = pickupStartTime.getTime();
  const end = pickupEndTime.getTime();
  const windowDuration = Math.max(1, end - start);

  const startPrice = Math.max(floorPrice, Math.round(originalPrice * 0.5));

  if (now >= end) {
    return { currentPrice: floorPrice, platformFee: Math.round(floorPrice * 0.1) };
  }

  if (now <= start) {
    return { currentPrice: startPrice, platformFee: Math.round(startPrice * 0.1) };
  }

  const elapsed = now - start;
  const baseRatio = elapsed / windowDuration;

  let decaySpeed: number;
  if (viewCount >= 30) {
    decaySpeed = 0.6;
  } else if (viewCount < 5) {
    decaySpeed = 1.5;
  } else {
    decaySpeed = 1.5 - ((viewCount - 5) * 0.9) / 25;
  }

  const adjustedRatio = Math.min(1, baseRatio * decaySpeed);
  const rawPrice = startPrice - (startPrice - floorPrice) * adjustedRatio;
  const currentPrice = Math.max(floorPrice, Math.round(rawPrice));

  return { currentPrice, platformFee: Math.round(currentPrice * 0.1) };
}
