import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  packed: boolean;
  onSave: (value: string) => void;
};

export default function EditableItemName({
  value,
  packed,
  onSave,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function save() {
    onSave(draft);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            save();
          }

          if (event.key === "Escape") {
            setDraft(value);
            setIsEditing(false);
          }
        }}
        className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1 text-slate-900 outline-none focus:border-slate-900"
      />
    );
  }

  return (
    <div className="group relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setIsEditing(true);
        }}
        className={`w-full truncate rounded-lg px-2 py-1 text-left transition hover:bg-slate-100 ${
          packed ? "text-slate-400 line-through" : "text-slate-900"
        }`}
      >
        {value}
      </button>

      <span className="pointer-events-none absolute -top-8 left-0 z-20 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
        Click to edit
      </span>
    </div>
  );
}