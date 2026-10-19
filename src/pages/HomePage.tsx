import {  type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type Trip } from "../types";

type Props = {
  trips: Trip[];
  onCreateTrip: (name: string) => string;
  onDeleteTrip: (tripId: string) => void;
};

export default function HomePage({
  trips,
  onCreateTrip,
  onDeleteTrip,
}: Props) {
  const [tripName, setTripName] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = tripName.trim();
    if (!name) return;

    const tripId = onCreateTrip(name);
    setTripName("");
    navigate(`/trips/${tripId}`);
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                My Trips
              </h1>
              <p className="mt-1 text-slate-600">
                Create trip checklists and build a reusable default packing list.
              </p>
            </div>

            <Link
              to="/defaults"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Defaults
            </Link>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mb-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={tripName}
            onChange={(event) => setTripName(event.target.value)}
            placeholder="Trip name, e.g. Lagos to Abuja"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
          >
            Create trip
          </button>
        </form>

        {trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-900">No trips yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Create your first trip to start packing.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {trips.map((trip) => {
              const packed = trip.items.filter((item) => item.packed).length;
              const total = trip.items.length;

              return (
                <li
                  key={trip.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/trips/${trip.id}`}
                      className="text-lg font-semibold text-slate-900 hover:underline"
                    >
                      {trip.name}
                    </Link>

                    <button
                      onClick={() => onDeleteTrip(trip.id)}
                      className="rounded-lg px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
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
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}