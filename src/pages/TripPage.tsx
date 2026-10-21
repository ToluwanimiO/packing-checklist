import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { AppData, Item } from "../types";
import EditableItemName from "../components/EditableItemName";
import { generatePackingList } from "../lib/generatePackingList";
import GeneratedPackingListModal from "../components/GeneratedPackingListModal";

type Props = {
  data: AppData;
  onAddItem: (tripId: string, name: string) => void;
  onAddItems: (tripId: string, items: Item[]) => void;
  onRenameItem: (tripId: string, itemId: string, name: string) => void;
  onTogglePacked: (tripId: string, itemId: string) => void;
  onToggleDefault: (tripId: string, itemId: string) => void;
  onDeleteItem: (tripId: string, itemId: string) => void;
  onToggleAutoDefaults: (value: boolean) => void;
  onDeleteTrip: (tripId: string) => void;
};

export default function TripPage({
  data,
  onAddItem,
  onRenameItem,
  onTogglePacked,
  onToggleDefault,
  onDeleteItem,
  onToggleAutoDefaults,
  onAddItems,
  onDeleteTrip,
}: Props) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [itemName, setItemName] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tripDescription, setTripDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<Item[]>([]);

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
          <h1 className="text-2xl font-bold text-slate-900">Trip not found</h1>
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
    if (!trip) return;
    onAddItem(trip.id, itemName);
    setItemName("");
    inputRef.current?.focus();
  }

  async function handleGeneratePackingList() {
    if (!tripDescription.trim() || !trip?.id) return;

    setGenerating(true);
    setGenerationMessage("");

    try {
      const result = await generatePackingList(tripDescription);
      setGeneratedItems(result.items);
      setShowReviewModal(true);
      setTripDescription("");
      setShowGenerator(false);
      setGenerationMessage(result.message);
    } catch (error) {
      setGenerationMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto w-full max-w-xl px-4 pb-16">
        <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200/80 bg-slate-50/95 px-4 py-4 backdrop-blur-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-gray-700"
          >
            <span aria-hidden="true">←</span>
            My Trips
          </Link>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              ref={inputRef}
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder="Add an item, e.g. Phone charger"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-gray-500 focus:ring-4 focus:ring-gray-100"
            />

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              Add
            </button>
          </form>
        </div>

        <header className="pt-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-600">
                Packing checklist
              </p>
              <h1 className="break-words text-3xl font-bold tracking-tight text-slate-900">
                {trip.name}
              </h1>
            </div>

            <button
              onClick={() => {
                navigate("/");
                onDeleteTrip(trip.id);
              }}
              className="shrink-0 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete trip
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Your progress
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {packed}
                  <span className="text-base font-medium text-slate-400">
                    {" "}
                    / {total}
                  </span>
                </p>
              </div>

              <p className="text-sm font-semibold text-emerald-700">
                {total === 0
                  ? "Ready to start"
                  : `${Math.round((packed / total) * 100)}% packed`}
              </p>
            </div>

            <div
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Packing progress"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={packed}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: total === 0 ? "0%" : `${(packed / total) * 100}%`,
                }}
              />
            </div>
          </div>
        </header>

        {/* AI packing list generator */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-600 text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
                  <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Pack smarter with AI
                  </h2>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                    AI powered
                  </span>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  Tell us where you're going and what you'll be doing. Get a
                  packing list tailored to your trip.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowGenerator((current) => !current);
              }}
              aria-expanded={showGenerator}
              aria-controls="ai-packing-generator"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              {showGenerator ? "Close AI generator" : "Generate with AI"}

              {!showGenerator && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              )}

              {showGenerator && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              )}
            </button>
          </div>

          {showGenerator && (
            <div
              id="ai-packing-generator"
              className="border-t border-gray-100 p-5 sm:p-6"
            >
              <div className="mb-4">
                <label
                  htmlFor="trip-description"
                  className="text-sm font-semibold text-slate-800"
                >
                  Describe your trip
                </label>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your destination, duration, purpose, and activities help us
                  create a more useful list.
                </p>
              </div>

              <textarea
                id="trip-description"
                value={tripDescription}
                onChange={(event) => setTripDescription(event.target.value)}
                placeholder="e.g. I'm going for NYSC camp in Nigeria for three weeks..."
                maxLength={1000}
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-500 focus:bg-white focus:ring-4 focus:ring-gray-100"
              />

              <div className="mt-2 flex items-start justify-between gap-3">
                <p className="text-xs leading-5 text-slate-500">
                  Be as specific as you like.
                </p>
                <span className="shrink-0 text-xs tabular-nums text-slate-400">
                  {tripDescription.length}/1000
                </span>
              </div>

              <button
                type="button"
                onClick={handleGeneratePackingList}
                disabled={generating || !tripDescription.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {generating ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Generating your list...
                  </>
                ) : (
                  "Create my packing list"
                )}
              </button>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Add new items to default list
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Reuse new items on future trips.
              </span>
            </span>

            <input
              type="checkbox"
              checked={data.autoAddToDefaults}
              onChange={(event) => onToggleAutoDefaults(event.target.checked)}
              className="h-5 w-5 shrink-0 accent-gray-600"
            />
          </label>
        </section>

        {trip.items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 5V3h8v2" />
                <path d="m9 13 2 2 4-4" />
              </svg>
            </div>

            <h2 className="mt-4 font-semibold text-slate-900">
              Your list is ready to begin
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
              Add items above or use the AI generator to create a personalized
              checklist for this trip.
            </p>
          </div>
        ) : (
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">Your items</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {total} {total === 1 ? "item" : "items"}
              </span>
            </div>

            <ul className="space-y-3">
              {trip.items.map((item: Item) => (
                <li
                  key={item.id}
                  className={`rounded-2xl border bg-white p-4 transition ${
                    item.packed
                      ? "border-emerald-100 bg-emerald-50/40"
                      : "border-slate-200 shadow-sm hover:border-slate-300"
                  }`}
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
                      aria-label={`Delete ${item.name}`}
                      className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>

                  <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
                    <input
                      type="checkbox"
                      checked={item.isDefault}
                      onChange={() => onToggleDefault(trip.id, item.id)}
                      className="h-4 w-4 accent-gray-600"
                    />
                    Save as default for future trips
                  </label>
                </li>
              ))}

              <div ref={listEndRef} />
            </ul>
            {showReviewModal && (
              <GeneratedPackingListModal
                items={generatedItems}
                message={generationMessage}
                onClose={() => setShowReviewModal(false)}
                onSave={(selectedItems) => {
                  onAddItems(trip.id, selectedItems);
                  setShowReviewModal(false);
                }}
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
