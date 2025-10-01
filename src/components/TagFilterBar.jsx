import { forwardRef } from "react";

const TagFilterBar = forwardRef(function TagFilterBar(
  { items = [], activeKeys = [], onToggle },
  ref
) {
  return (
    <div ref={ref} className="w-full flex justify-center">
      <div className="w-[340px] max-w-[92%]">
        <div
          className="chip-scroll mask-fade-x flex gap-3 overflow-x-auto py-2
                     scroll-smooth snap-x snap-mandatory"
        >
          {items.map((c) => {
            const on = activeKeys.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onToggle?.(c.key)}
                aria-pressed={on}
                className={`snap-start shrink-0 inline-flex items-center gap-2 px-4 py-[10px]
                            rounded-full border transition-all duration-200
                            ${on
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                    : "bg-white/85 text-gray-900 border-gray-200 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_6px_16px_rgba(2,6,23,0.06)] hover:bg-gray-50"
                  }`}
              >
                <span className="text-lg">{c.icon}</span>
                <span className="text-base font-semibold">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default TagFilterBar;
