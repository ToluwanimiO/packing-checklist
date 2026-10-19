import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { AppData, Item } from "../types";
import EditableItemName from "../components/EditableItemName";

type Props = {
  data: AppData;
  onAddItem: (tripId: string, name: string) => void;
  onRenameItem: (tripId: string, itemId: string, name: string) => void;
  onTogglePacked: (tripId: string, itemId: string) => void;
  onToggleDefault: (tripId: string, itemId: string) => void;
  onDeleteItem: (tripId: string, itemId: string) => void;
  onToggleAutoDefaults: (value: boolean) => void;
};

export default function TripPage({
  data,
  onAddItem,
  onRenameItem,
  onTogglePacked,
  onToggleDefault,
  onDeleteItem,
  onToggleAutoDefaults,
}: Props) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);


  const trip = data.trips.find((current) => current.id === tripId);
  const previousItemCount = useRef(0);

  useEffect(() => {
    if (!trip) return;

    if (trip.items.length > previousItemCount.current) {
      listEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    previousItemCount.current = trip.items.length;
  }, [trip?.items.length, trip]);

  if (!trip) {
    return (
      <main className="min-h-dvh bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Trip not found
          </h1>
          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 font-medium text-white"
          >
            Back to My Trips
          </Link>
        </div>
      </main>
    );
  }

  const packed = trip.items.filter((item) => item.packed).length;
  const total = trip.items.length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!trip) return;
    onAddItem(trip.id, itemName);
    setItemName("");
    inputRef.current?.focus();

  }

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto w-full max-w-xl px-4 pb-16">
        <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur">
          <Link
            to="/"
            className="mb-3 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← My Trips
          </Link>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                ref={inputRef}
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder="Add an item, e.g. Phone charger"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
            >
              Add
            </button>
          </form>
        </div>

        <header className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {trip.name}
            </h1>

            <button
              onClick={() => {
                navigate("/");
              }}
              className="rounded-lg px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete trip
            </button>
          </div>

          <p className="mt-2 text-slate-600">
            {packed} of {total} packed
          </p>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: total === 0 ? "0%" : `${(packed / total) * 100}%`,
              }}
            />
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="font-medium text-slate-900">
              Add new items to default list
            </span>

            <input
              type="checkbox"
              checked={data.autoAddToDefaults}
              onChange={(event) =>
                onToggleAutoDefaults(event.target.checked)
              }
              className="h-5 w-5 accent-slate-900"
            />
          </label>

          <p className="mt-2 text-sm text-slate-600">
            When ON, newly added items are saved as defaults for future trips.
          </p>
        </section>

        {trip.items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-900">No items yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Add your first packing item above.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {trip.items.map((item: Item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => onTogglePacked(trip.id, item.id)}
                      className="h-5 w-5 shrink-0 accent-emerald-600"
                    />

                    <EditableItemName
                      value={item.name}
                      packed={item.packed}
                      onSave={(name) => onRenameItem(trip.id, item.id, name)}
                    />
                  </label>

                  <button
                    onClick={() => onDeleteItem(trip.id, item.id)}
                    className="shrink-0 rounded-lg px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={item.isDefault}
                    onChange={() => onToggleDefault(trip.id, item.id)}
                    className="h-4 w-4 accent-slate-900"
                  />

                  Save as default for future trips
                </label>
              </li>
            ))}

            <div ref={listEndRef} />
          </ul>
        )}
      </div>
    </main>
  );
}