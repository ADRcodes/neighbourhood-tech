const PaginationControls = ({
  page = 1,
  totalPages = 1,
  onPageChange = () => { },
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleChange = (nextPage) => {
    if (nextPage === page) return;
    if (nextPage < 1 || nextPage > totalPages) return;
    onPageChange(nextPage);
  };

  const baseButton =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border border-brand-200 bg-surface text-text shadow-sm transition";

  const pills = buildPagePills(page, totalPages);

  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-label="Pagination">
      <div className="relative flex items-center justify-between gap-3 min-h-[40px]">
        <button
          type="button"
          onClick={() => handleChange(page - 1)}
          disabled={!canPrev}
          className={`${baseButton} shrink-0 ${canPrev ? "hover:border-brand-300 hover:bg-surface/80" : "opacity-40 cursor-not-allowed"
            }`}
        >
          Previous
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-text-muted">
          Page {page} of {totalPages}
        </div>
        <button
          type="button"
          onClick={() => handleChange(page + 1)}
          disabled={!canNext}
          className={`${baseButton} shrink-0 ${canNext ? "hover:border-brand-300 hover:bg-surface/80" : "opacity-40 cursor-not-allowed"
            }`}
        >
          Next
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {pills.map((pill) => {
          if (pill.type === "ellipsis") {
            return (
              <span key={pill.key} className="px-2 text-sm text-text-muted">
                ...
              </span>
            );
          }
          const isActive = pill.page === page;
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => handleChange(pill.page)}
              aria-current={isActive ? "page" : undefined}
              className={`px-2 py-1 text-sm font-semibold border-b-2 transition ${isActive
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text hover:border-brand-300"
                }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaginationControls;

function buildPagePills(page, totalPages) {
  if (totalPages <= 1) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: "page",
      page: index + 1,
      label: `${index + 1}`,
      key: `page-${index + 1}`,
    }));
  }

  const pills = [];
  const windowStart = Math.max(2, page - 1);
  const windowEnd = Math.min(totalPages - 1, page + 1);

  pills.push({ type: "page", page: 1, label: "1", key: "page-1" });
  if (windowStart > 2) {
    pills.push({ type: "ellipsis", key: "ellipsis-start" });
  }
  for (let p = windowStart; p <= windowEnd; p += 1) {
    pills.push({ type: "page", page: p, label: `${p}`, key: `page-${p}` });
  }
  if (windowEnd < totalPages - 1) {
    pills.push({ type: "ellipsis", key: "ellipsis-end" });
  }
  pills.push({
    type: "page",
    page: totalPages,
    label: `${totalPages}`,
    key: `page-${totalPages}`,
  });

  return pills;
}
