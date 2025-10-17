// src/components/TagFilterBar.jsx
import { forwardRef } from "react";

// utility so we don't repeat the long string
const HIDE_SCROLLBAR =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

const TagFilterBar = forwardRef(function TagFilterBar(
  { items = [], activeKeys = [], onToggle },
  ref
) {
  return (
    <div ref={ref} className="w-full flex justify-center">
      <div className="w-[340px] max-w-[92%]">
        <div
          className={`mask-fade-x flex gap-3 overflow-x-auto py-2
                      scroll-smooth snap-x snap-mandatory ${HIDE_SCROLLBAR}`}
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
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                    : "bg-white/85 text-gray-900 border-gray-200 shadow-md shadow-gray-200 hover:bg-gray-50"
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
