import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import type { AppData, Item, Trip } from "./types";
import { createId, loadData, saveData } from "./storage";
import HomePage from "./pages/HomePage";
import TripPage from "./pages/TripPage";
import DefaultsPage from "./pages/DefaultsPage";

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  function createTrip(name: string) {
    const itemsFromDefaults: Item[] = data.defaultItems.map((item) => ({
      id: createId(),
      name: item.name,
      packed: false,
      isDefault: true,
    }));

    const newTrip: Trip = {
      id: createId(),
      name: name.trim(),
      createdAt: Date.now(),
      items: itemsFromDefaults,
    };

    setData((current) => ({
      ...current,
      trips: [newTrip, ...current.trips],
    }));

    return newTrip.id;
  }

  function deleteTrip(tripId: string) {
    setData((current) => ({
      ...current,
      trips: current.trips.filter((trip) => trip.id !== tripId),
    }));
  }

  function addItem(tripId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setData((current) => {
      const shouldBeDefault = current.autoAddToDefaults;

      const newItem: Item = {
        id: createId(),
        name: trimmed,
        packed: false,
        isDefault: shouldBeDefault,
      };

      return {
        ...current,
        defaultItems: shouldBeDefault
          ? [
              ...current.defaultItems,
              {
                id: createId(),
                name: trimmed,
                packed: false,
                isDefault: true,
              },
            ]
          : current.defaultItems,
        trips: current.trips.map((trip) =>
          trip.id !== tripId
            ? trip
            : {
                ...trip,
                items: [...trip.items, newItem],
              },
        ),
      };
    });
  }

  function renameItem(tripId: string, itemId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setData((current) => {
      const trip = current.trips.find((item) => item.id === tripId);
      const oldItem = trip?.items.find((item) => item.id === itemId);

      return {
        ...current,
        defaultItems: current.defaultItems.map((item) =>
          oldItem && item.name.toLowerCase() === oldItem.name.toLowerCase()
            ? { ...item, name: trimmed }
            : item,
        ),
        trips: current.trips.map((currentTrip) =>
          currentTrip.id !== tripId
            ? currentTrip
            : {
                ...currentTrip,
                items: currentTrip.items.map((item) =>
                  item.id === itemId ? { ...item, name: trimmed } : item,
                ),
              },
        ),
      };
    });
  }

  function togglePacked(tripId: string, itemId: string) {
    updateTripItem(tripId, itemId, (item) => ({
      ...item,
      packed: !item.packed,
    }));
  }

  function toggleDefault(tripId: string, itemId: string) {
    setData((current) => {
      const trip = current.trips.find((item) => item.id === tripId);
      const item = trip?.items.find((currentItem) => currentItem.id === itemId);

      if (!trip || !item) return current;

      const nextIsDefault = !item.isDefault;

      return {
        ...current,
        defaultItems: nextIsDefault
          ? [
              ...current.defaultItems.filter(
                (defaultItem) =>
                  defaultItem.name.toLowerCase() !== item.name.toLowerCase(),
              ),
              {
                id: createId(),
                name: item.name,
                packed: false,
                isDefault: true,
              },
            ]
          : current.defaultItems.filter(
              (defaultItem) =>
                defaultItem.name.toLowerCase() !== item.name.toLowerCase(),
            ),
        trips: current.trips.map((currentTrip) =>
          currentTrip.id !== tripId
            ? currentTrip
            : {
                ...currentTrip,
                items: currentTrip.items.map((currentItem) =>
                  currentItem.id === itemId
                    ? { ...currentItem, isDefault: nextIsDefault }
                    : currentItem,
                ),
              },
        ),
      };
    });
  }

  function deleteItem(tripId: string, itemId: string) {
    setData((current) => {
      const trip = current.trips.find((item) => item.id === tripId);
      const item = trip?.items.find((currentItem) => currentItem.id === itemId);

      return {
        ...current,
        defaultItems:
          item && item.isDefault
            ? current.defaultItems.filter(
                (defaultItem) =>
                  defaultItem.name.toLowerCase() !== item.name.toLowerCase(),
              )
            : current.defaultItems,
        trips: current.trips.map((currentTrip) =>
          currentTrip.id !== tripId
            ? currentTrip
            : {
                ...currentTrip,
                items: currentTrip.items.filter(
                  (currentItem) => currentItem.id !== itemId,
                ),
              },
        ),
      };
    });
  }

  function updateTripItem(
    tripId: string,
    itemId: string,
    updater: (item: Item) => Item,
  ) {
    setData((current) => ({
      ...current,
      trips: current.trips.map((trip) =>
        trip.id !== tripId
          ? trip
          : {
              ...trip,
              items: trip.items.map((item) =>
                item.id === itemId ? updater(item) : item,
              ),
            },
      ),
    }));
  }

  function setAutoAddToDefaults(value: boolean) {
    setData((current) => ({
      ...current,
      autoAddToDefaults: value,
    }));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              trips={data.trips}
              onCreateTrip={createTrip}
              onDeleteTrip={deleteTrip}
            />
          }
        />

        <Route
          path="/trips/:tripId"
          element={
            <TripPage
              data={data}
              onAddItem={addItem}
              onRenameItem={renameItem}
              onTogglePacked={togglePacked}
              onToggleDefault={toggleDefault}
              onDeleteItem={deleteItem}
              onToggleAutoDefaults={setAutoAddToDefaults}
            />
          }
        />

        <Route
          path="/defaults"
          element={
            <DefaultsPage
              defaultItems={data.defaultItems}
              onRenameDefault={renameDefault}
              onDeleteDefault={deleteDefault}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );

  function renameDefault(defaultItemId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setData((current) => ({
      ...current,
      defaultItems: current.defaultItems.map((item) =>
        item.id === defaultItemId ? { ...item, name: trimmed } : item,
      ),
    }));
  }

  function deleteDefault(defaultItemId: string) {
    setData((current) => ({
      ...current,
      defaultItems: current.defaultItems.filter(
        (item) => item.id !== defaultItemId,
      ),
    }));
  }
}