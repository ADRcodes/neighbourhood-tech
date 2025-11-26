export default function TagList({
  items = [],
  activeKeys = [],
  onToggle,
  title = "Tags",
  emptyLabel = "No tags available",
  className = "",
}) {
  const isOn = (k) => activeKeys.includes(k);

  return (
    <div className={`space-y-2 ${className}`}>
      {title && <h4 className="text-sm font-semibold text-text">{title}</h4>}
      {items.length === 0 ? (
        <p className="text-xs text-text-muted">{emptyLabel}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((t) => {
            const on = isOn(t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onToggle?.(t.key)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/80 ${on
                    ? "bg-primary text-onprimary border-primary shadow-sm shadow-primary/30"
                    : "bg-white text-text border-brand-200 hover:border-brand-300"
                  }`}
              >
                {t.icon && <span aria-hidden className="text-sm">{t.icon}</span>}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
