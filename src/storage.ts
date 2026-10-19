import { type AppData, emptyData } from "./types";

const STORAGE_KEY = "packing-checklist-v1";

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return emptyData;

    const parsed = JSON.parse(raw) as Partial<AppData>;

    const trips = parsed.trips ?? [];

    const migratedDefaultItems =
      parsed.defaultItems ??
      Array.from(
        new Map(
          trips
            .flatMap((trip) => trip.items)
            .filter((item) => item.isDefault)
            .map((item) => [item.name.toLowerCase(), item]),
        ).values(),
      ).map((item) => ({
        id: crypto.randomUUID(),
        name: item.name,
        packed: false,
        isDefault: true,
      }));

    return {
      trips,
      defaultItems: migratedDefaultItems,
      autoAddToDefaults: parsed.autoAddToDefaults ?? true,
    };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createId() {
  return crypto.randomUUID();
}