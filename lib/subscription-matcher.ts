type SubscribablePackage = {
  id: string;
  allergenTags: string[];
  [key: string]: unknown;
};

export function matchPackageForUser(
  packages: SubscribablePackage[],
  userDietaryPreferences: string[],
): SubscribablePackage | null {
  if (userDietaryPreferences.length === 0) {
    return packages[0] ?? null;
  }

  const prefs = new Set(userDietaryPreferences.map((p) => p.toLowerCase()));

  const safe = packages.filter((pkg) =>
    pkg.allergenTags.every((tag) => !prefs.has(tag.toLowerCase())),
  );

  return safe[0] ?? null;
}
