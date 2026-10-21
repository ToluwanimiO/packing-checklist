
import type { Item } from "../types";

type GeneratedItem = {
  name: string;
  category: string;
  quantity: number;
};

type GeneratedList = {
  status: "specialized" | "general" | "fallback";
  message: string;
  items: GeneratedItem[];
};

export async function generatePackingList(
  description: string
): Promise<{
  status: GeneratedList["status"];
  message: string;
  items: Item[];
}> {
  const response = await fetch("/api/generate-packing-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    console.log(response);
    const error = await response.json().catch(() => ({}));
    console.log(error);

    throw new Error(
      error.error || "Couldn't generate a packing list."
    );
  }

  const result: GeneratedList = await response.json();

  const items: Item[] = result.items.map((item) => ({
    id: crypto.randomUUID(),
    name:
      item.quantity > 1
        ? `${item.name} (x${item.quantity})`
        : item.name,
    packed: false,
    isDefault: false,
  }));

  return {
    status: result.status,
    message: result.message,
    items,
  };
}
