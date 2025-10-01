import { CHIP_KEYWORDS, getEventTagsLower, norm } from "./tags";

export function filterEvents(events, activeChips) {
  if (!activeChips?.length) return events;
  return events.filter((ev) => {
    const haystack = `${norm(ev.title)} ${norm(ev.company)} ${norm(ev?.venue?.name)}`;
    const tags = getEventTagsLower(ev);
    return activeChips.some((chip) =>
      (CHIP_KEYWORDS[chip] || []).some((kw) => {
        const k = norm(kw);
        return haystack.includes(k) || tags.some((t) => t.includes(k));
      })
    );
  });
}

export const recommendedOf = (events, n = 3) =>
  events.length > 4 ? events.slice(4, 4 + n) : [];
