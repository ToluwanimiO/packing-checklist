import { Link } from "react-router-dom";
import { type Item } from "../types";
import EditableItemName from "../components/EditableItemName";

type Props = {
  defaultItems: Item[];
  onRenameDefault: (defaultItemId: string, name: string) => void;
  onDeleteDefault: (defaultItemId: string) => void;
};

export default function DefaultsPage({
  defaultItems,
  onRenameDefault,
  onDeleteDefault,
}: Props) {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <Link
          to="/"
          className="mb-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← My Trips
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Default packing list
          </h1>
          <p className="mt-1 text-slate-600">
            These items will be added automatically when you create a new trip.
          </p>
        </header>

        {defaultItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-900">No default items yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Add an item to a trip with “Add new items to default list” turned on.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {defaultItems.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <EditableItemName
                      value={item.name}
                      packed={false}
                      onSave={(name) => onRenameDefault(item.id, name)}
                    />
                  </div>

                  <button
                    onClick={() => onDeleteDefault(item.id)}
                    className="shrink-0 rounded-lg px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}