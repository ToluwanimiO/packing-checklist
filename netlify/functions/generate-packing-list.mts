
import { GoogleGenAI } from "@google/genai";
import type { Config } from "@netlify/functions";

const packingListSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["specialized", "general"],
    },
    message: {
      type: "string",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          category: {
            type: "string",
          },
          quantity: {
            type: "integer",
          },
        },
        required: ["name", "category", "quantity"],
      },
    },
  },
  required: ["status", "message", "items"],
};

const defaultItems = [
  { name: "Clothes", category: "Clothing", quantity: 3 },
  { name: "Underwear", category: "Clothing", quantity: 3 },
  { name: "Socks", category: "Clothing", quantity: 3 },
  { name: "Toothbrush", category: "Toiletries", quantity: 1 },
  { name: "Toothpaste", category: "Toiletries", quantity: 1 },
  { name: "Bathing soap", category: "Toiletries", quantity: 1 },
  { name: "Towel", category: "Toiletries", quantity: 1 },
  { name: "Phone charger", category: "Electronics", quantity: 1 },
  { name: "Water bottle", category: "Essentials", quantity: 1 },
];

export default async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed. Use POST." },
      { status: 405 }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const body = await request.json();
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!description) {
      return Response.json(
        { error: "Please describe your trip." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    console.log("Gemini client initialized");

    console.log("Sending request to Gemini...");
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",

      system_instruction: `
You generate practical, personalized packing checklists.

The user will describe a trip, including details such as the
destination, purpose, duration, activities, accommodation, and
transportation.

Generate items that are relevant to the specific trip.

Rules:
- Include essential items and items specific to the trip.
- Consider the trip's purpose, duration, destination, and activities.
- Include sensible quantities for each item.
- Avoid duplicate items.
- Use clear, concise item names.
- Group items into useful categories such as Clothing,
  Toiletries, Documents, Electronics, Medication, and Essentials.
- Do not invent mandatory requirements or assume the user has
  a particular medical condition.
- If the description provides enough detail, use status
  "specialized".
- If the description is too vague for a tailored list, use
  status "general" and create a useful general packing list.
- Return a helpful, brief message explaining the kind of list
  generated.
- Return only data matching the requested JSON schema.
      `.trim(),

      input: `Generate a packing checklist for this trip:\n${description}`,

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: packingListSchema,
      },
    });



    console.log("Gemini response received");

    const output = interaction.output_text;
    console.log(output)
    if (!output) {
      throw new Error("Gemini returned an empty response.");
    }

    const result = JSON.parse(output);

    if (!Array.isArray(result.items)) {
      throw new Error("Gemini returned an invalid packing list.");
    }

    const items = result.items.filter(
      (item: { name?: unknown; category?: unknown; quantity?: unknown }) =>
        typeof item.name === "string" &&
        item.name.trim().length > 0 &&
        typeof item.category === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1
    );

    if (items.length === 0) {
      throw new Error("Gemini did not return any valid packing items.");
    }

    return Response.json({
      status:
        result.status === "specialized" ? "specialized" : "general",
      message:
        typeof result.message === "string" && result.message.trim()
          ? result.message
          : "Your packing list is ready.",
      items,
    });
  } catch (error) {
    console.error("Packing list generation failed:", error);

    return Response.json({
      status: "fallback",
      message:
        "AI generation failed. Here's a general packing list instead.",
      items: defaultItems,
    });
  }
};

export const config: Config = {
  path: "/api/generate-packing-list",
};
