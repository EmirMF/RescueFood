import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export async function estimateCo2SavedGrams(
  title: string,
  category: string,
  quantity: number,
): Promise<number> {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackEstimate(category, quantity);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "You are a food waste carbon footprint expert.",
                "A food rescue platform saved food from going to landfill.",
                `Food: "${title}", Category: ${category}, Portions saved: ${quantity}.`,
                "Estimate the total CO2 emissions (in grams) saved by rescuing this food.",
                "Typical values: 1 portion of rice meal ≈ 600-900g CO2, bakery ≈ 200-400g CO2, produce ≈ 100-250g CO2.",
                "Reply with a single integer number only. No units, no explanation.",
              ].join(" "),
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() ?? "";
    const parsed = parseInt(text.replace(/[^0-9]/g, ""), 10);
    return isNaN(parsed) || parsed <= 0 ? fallbackEstimate(category, quantity) : parsed;
  } catch {
    return fallbackEstimate(category, quantity);
  }
}

function fallbackEstimate(category: string, quantity: number): number {
  const co2GramsPerPortion: Record<string, number> = {
    bakery: 310,
    rice_meal: 750,
    produce: 180,
    vegetarian: 260,
    snack: 150,
    beverage: 120,
  };
  return (co2GramsPerPortion[category] ?? 280) * quantity;
}
