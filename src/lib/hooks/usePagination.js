import { useEffect, useMemo, useState } from "react";

export function usePagination({
  items = [],
  pageSize = 50,
  initialPage = 1,
  resetKey = "",
} = {}) {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(Math.max(page, 1), totalPages);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, resetKey]);

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [page, clampedPage]);

  const pageItems = useMemo(() => {
    if (!items.length) return [];
    const start = (clampedPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, clampedPage]);

  return {
    page: clampedPage,
    totalPages,
    pageItems,
    setPage,
  };
}
