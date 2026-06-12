import { prisma } from "../lib/prisma.js";

const now = new Date();

const listings = await prisma.foodListing.findMany({
  where: { status: "ACTIVE" },
  select: { id: true, title: true },
});

for (const l of listings) {
  const start = new Date(now.getTime() - 30 * 60 * 1000);
  const end   = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  await prisma.foodListing.update({
    where: { id: l.id },
    data: {
      pickupStartTime: start,
      pickupEndTime: end,
      consumeBefore: new Date(now.getTime() + 9 * 60 * 60 * 1000),
      viewCount: 0,
    },
  });
  console.log(`Updated: ${l.title}`);
}

console.log(`\nPickup window: started 30 min ago, ends in 7h. Total window = 7.5h`);
console.log(`Elapsed ratio now: ~${((0.5 / 7.5) * 100).toFixed(1)}% of window`);
await prisma.$disconnect();
