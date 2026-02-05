import { useState } from "react";
import Collapse from "./Collapse";
import TagList from "./TagList";

export default function FiltersPanel({
  searchTerm = "",
  onSearchChange = () => { },
  searchPlaceholder = "Search events nearby",
  title = "Filters",
  initialOpen = false,
  availableSources = [],
  activeSources = [],
  onToggleSource = () => { },
  availableLocations = [],
  activeLocations = [],
  onToggleLocation = () => { },
  availableTags = [],
  activeTags = [],
  onToggleTag = () => { },
  className = "",
}) {
  const [open, setOpen] = useState(initialOpen);
  const activeSummary = [];

  const sourceLabelMap = new Map(availableSources.map((item) => [item.key, item.label]));
  const locationLabelMap = new Map(availableLocations.map((item) => [item.key, item.label]));
  const tagLabelMap = new Map(availableTags.map((item) => [item.key, item.label]));

  activeSources.forEach((key) => {
    const label = sourceLabelMap.get(key);
    if (label) activeSummary.push({ key, label, kind: "source" });
  });
  activeLocations.forEach((key) => {
    const label = locationLabelMap.get(key);
    if (label) activeSummary.push({ key, label, kind: "location" });
  });
  activeTags.forEach((key) => {
    const label = tagLabelMap.get(key);
    if (label) activeSummary.push({ key, label, kind: "tag" });
  });

  const summaryLabels = activeSummary;

  const handleSummaryToggle = (item) => {
    if (item.kind === "source") {
      onToggleSource?.(item.key);
    } else if (item.kind === "location") {
      onToggleLocation?.(item.key);
    } else {
      onToggleTag?.(item.key);
    }
  };

  return (
    <section className={`rounded-squircle-lg border border-brand-100 bg-white shadow-sm p-3 space-y-3 ${className}`}>
      <div className="relative">
        <span className="pointer-events-none text-2xl absolute left-3 top-1/2 -translate-y-1/2 opacity-60">⌕</span>
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full pl-8 pr-3 py-2 rounded-squircle text-sm bg-white border border-brand-100 focus:ring-1 focus:ring-focus ring-primary outline-none"
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-squircle border border-brand-200 bg-surface px-4 py-3 m-0 text-left text-sm font-semibold text-text shadow-sm hover:border-brand-300 transition"
        aria-expanded={open}
      >
        <span className="inline-flex flex-wrap items-center gap-2">
          <span>{title}</span>
          {!open && summaryLabels.length > 0 && (
            <span className="inline-flex flex-wrap gap-2 text-xs font-semibold text-text-muted">
              {summaryLabels.map((item) => (
                <button
                  key={`${item.kind}-${item.key}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSummaryToggle(item);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/80 bg-brand-100/70 text-text border-brand-200 shadow-sm cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </span>
          )}
        </span>
        <span className="text-lg" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      <Collapse open={open} duration={500}>
        <div className="space-y-4 pt-2">
          <TagList
            title="Filter by source"
            items={availableSources}
            activeKeys={activeSources}
            onToggle={onToggleSource}
            emptyLabel="Sources will appear once events load."
          />
          <TagList
            title="Filter by location"
            items={availableLocations}
            activeKeys={activeLocations}
            onToggle={onToggleLocation}
            emptyLabel="Locations will appear once events load."
          />
          <TagList
            title="Filter by tag"
            items={availableTags}
            activeKeys={activeTags}
            onToggle={onToggleTag}
            emptyLabel="Tags will appear once events load."
          />
        </div>
      </Collapse>
    </section>
  );
}
