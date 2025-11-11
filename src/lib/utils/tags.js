export const norm = (v) => (v == null ? "" : String(v).toLowerCase());

export const getEventTagsLower = (ev) => {
  const candidates = [ev.tags, ev.event_tags, ev.tagNames, ev.tag_list];
  return candidates.flatMap((x) => (Array.isArray(x) ? x : [])).map(norm);
};
