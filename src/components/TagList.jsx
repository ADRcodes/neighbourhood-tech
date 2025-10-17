export default function TagList({ items = [], activeKeys = [], onToggle, title = "Tags" }) {
  const isOn = (k) => activeKeys.includes(k);

  return (
    <div className="space-y-2">
      {title && <h4 className="text-sm font-semibold">{title}</h4>}
      <ul className="space-y-2">
        {items.map((t) => {
          const on = isOn(t.key);
          return (
            <li key={t.key}>
              <button
                type="button"
                onClick={() => onToggle?.(t.key)}
                aria-pressed={on}
                className={[
                  "w-full inline-flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm border transition",
                  on
                    ? "bg-primary text-onprimary border-transparent"
                    : "bg-[color:var(--color-surface)] text-[color:var(--color-text)] border-[color:var(--color-brand-100)] hover:border-[color:var(--color-brand-200)]",
                ].join(" ")}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="text-base leading-none">{t.icon}</span>
                  <span className="font-medium">{t.label}</span>
                </span>
                <span
                  aria-hidden
                  className={["h-2.5 w-2.5 rounded-full", on ? "bg-accent" : "bg-[color:var(--color-brand-100)]"].join(" ")}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
