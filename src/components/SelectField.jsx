import { useEffect, useRef, useState } from "react";

const OPTION_HEIGHT = 40;

export default function SelectField({
  label,
  placeholder = "Select an option",
  value,
  options = [],
  onChange = () => {},
  onCreate,
  id,
  name,
  disabled,
}) {
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const index = options.findIndex((opt) => String(opt.value) === String(value));
      if (index >= 0) {
        listRef.current.scrollTo({
          top: Math.max(index * OPTION_HEIGHT - OPTION_HEIGHT, 0),
          behavior: "smooth",
        });
      }
    }
  }, [open, value, options]);

  const activeLabel = options.find((opt) => String(opt.value) === String(value))?.label;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.value } });
    setOpen(false);
    setQuery("");
  };

  const handleCreate = () => {
    if (!onCreate || !query.trim()) return;
    onCreate(query.trim());
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => {
          if (disabled) return;
          const nextOpen = !open;
          setOpen(nextOpen);
          if (!nextOpen) {
            setQuery("");
          } else {
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
        disabled={disabled}
        className={`w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-left text-sm text-text shadow-inner transition focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary flex items-center justify-between gap-3 ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:border-brand-300"
        }`}
      >
        <span className={`truncate ${activeLabel ? "text-text" : "text-text-muted"}`}>
          {activeLabel || placeholder}
        </span>
        <span className={`text-text-muted transition-transform ${open ? "rotate-180" : "rotate-0"}`}>
          ▾
        </span>
      </button>
      {open && !disabled && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-brand-200 bg-surface shadow-xl">
          <div className="px-4 py-3 border-b border-brand-100/60">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search or add new"
              className="w-full rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-text shadow-inner focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {filteredOptions.length ? (
              filteredOptions.map((opt) => {
                const isActive = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition flex justify-between items-center ${
                      isActive
                        ? "bg-brand-100/70 text-text font-semibold"
                        : "text-text hover:bg-surface/80"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && <span className="text-xs">✓</span>}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-text-muted">No matches yet.</div>
            )}
          </div>
          {onCreate && query.trim() && !filteredOptions.length && (
            <div className="border-t border-brand-100/60 bg-surface/70 px-4 py-3">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-onprimary px-3 py-1.5 text-xs font-semibold shadow-[0_12px_24px_-18px_rgba(220,73,102,0.9)]"
              >
                ＋ Add “{query.trim()}”
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
