import { useState } from "react";
import { type Item } from "../types";

type Props = {
    items: Item[];
  onClose: () => void;
  onSave: (selectedItems: Item[]) => void;
};

export default function GeneratedPackingListModal({
  items,
  onClose,
  onSave,
}:Props) {
  const [selectedItems, setSelectedItems] = useState(() =>
    items.map((item) => item.id)
  );

  const allSelected = selectedItems.length === items.length;

  const toggleItem = (id:string) => {
    setSelectedItems((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    setSelectedItems(
      allSelected ? [] : items.map((item) => item.id)
    );
  };

  const handleSave = () => {
    const selected = items.filter((item) =>
      selectedItems.includes(item.id)
    );

    onSave(selected);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="generated-list-title"
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="generated-list-title"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              Review your packing list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your personalized packing list is ready.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="px-5 pt-4 sm:px-6">
          <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
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
            <p className="text-sm leading-5 text-slate-600">
              We've selected all the suggested items for you.
              Uncheck anything you don't need. Only selected
              items will be added to your checklist.
            </p>
          </div>
        </div>

        {/* List controls */}
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
          <p className="text-sm font-medium text-slate-700">
            {selectedItems.length} of {items.length} selected
          </p>

          <button
            type="button"
            onClick={toggleAll}
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus:outline-none focus:underline"
          >
            {allSelected ? "Unselect all" : "Select all"}
          </button>
        </div>

        {/* Scrollable checklist */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-6">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No items were generated. Close this window and try again.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {items.map((item) => {
                const checked = selectedItems.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-3 p-3.5 transition hover:bg-slate-50 ${
                      checked ? "bg-white" : "bg-slate-50/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />

                    <span
                      className={`text-sm leading-5 ${
                        checked
                          ? "text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {item.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedItems.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            Add selected items ({selectedItems.length})
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}