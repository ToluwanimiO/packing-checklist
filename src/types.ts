export type Item = {
  id: string;
  name: string;
  packed: boolean;
  isDefault: boolean;
};

export type Trip = {
  id: string;
  name: string;
  createdAt: number;
  items: Item[];
};

export type AppData = {
  trips: Trip[];
  defaultItems: Item[];
  autoAddToDefaults: boolean;
};

export const emptyData: AppData = {
  trips: [],
  defaultItems: [],
  autoAddToDefaults: true,
};