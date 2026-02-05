import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export default function TagList({
  items = [],
  activeKeys = [],
  onToggle,
  title = "Tags",
  emptyLabel = "No tags available",
  className = "",
  maxVisibleRows = 2,
}) {
  const isOn = (k) => activeKeys.includes(k);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState(null);
  const [expandedHeight, setExpandedHeight] = useState(null);

  const itemKeys = useMemo(() => items.map((item) => item.key).join("|"), [items]);

  useEffect(() => {
    setExpanded(false);
  }, [itemKeys, maxVisibleRows]);

  useLayoutEffect(() => {
    const node = listRef.current;
    if (!node) {
      setCollapsedHeight(null);
      setExpandedHeight(null);
      return undefined;
    }

    let frame = null;
    const measure = () => {
      const chips = Array.from(node.children);
      if (chips.length === 0) {
        setCollapsedHeight(null);
        setExpandedHeight(null);
        return;
      }

      setExpandedHeight(node.scrollHeight || null);

      const containerRect = node.getBoundingClientRect();
      const rows = chips
        .map((chip) => {
          const rect = chip.getBoundingClientRect();
          return {
            top: Math.round(rect.top - containerRect.top),
            bottom: Math.round(rect.bottom - containerRect.top),
          };
        })
        .sort((a, b) => a.top - b.top);

      const rowTops = Array.from(new Set(rows.map((row) => row.top)));
      if (rowTops.length <= maxVisibleRows) {
        setCollapsedHeight(null);
        return;
      }

      const cutoffTop = rowTops[maxVisibleRows - 1];
      const maxBottom = rows.reduce((max, row) => {
        if (row.top <= cutoffTop) {
          return Math.max(max, row.bottom);
        }
        return max;
      }, 0);

      setCollapsedHeight(maxBottom || null);
    };

    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(schedule);
      observer.observe(node);
      return () => {
        if (frame) cancelAnimationFrame(frame);
        observer.disconnect();
      };
    }

    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, [itemKeys, maxVisibleRows]);

  const canCollapse = collapsedHeight != null;
  const containerStyle = canCollapse
    ? {
      maxHeight: expanded ? expandedHeight ?? collapsedHeight : collapsedHeight,
      overflow: "hidden",
    }
    : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      {title && <h4 className="text-sm font-semibold text-text">{title}</h4>}
      {items.length === 0 ? (
        <p className="text-xs text-text-muted">{emptyLabel}</p>
      ) : (
        <>
          <div
            ref={containerRef}
            style={containerStyle}
            className="transition-[max-height] duration-500 ease-out"
          >
            <div ref={listRef} className="flex flex-wrap gap-2 transition-all duration-500">
              {items.map((t) => {
                const on = isOn(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onToggle?.(t.key)}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/80 ${on
                        ? "bg-brand-100/70 text-text border-brand-300/70 shadow-sm"
                        : "bg-white text-text border-brand-200 hover:border-brand-300"
                      }`}
                  >
                    {t.icon && <span aria-hidden className="text-sm">{t.icon}</span>}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {canCollapse && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="text-xs font-semibold text-text-muted hover:text-text transition"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
