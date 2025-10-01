export const CHIPS = [
  { key: "social", label: "Social", icon: "☕️" },
  { key: "networking", label: "Networking", icon: "👥" },
  { key: "design", label: "Design", icon: "🧰" },
  { key: "funding", label: "Funding", icon: "💼" },
];

export const CHIP_KEYWORDS = {
  social: ["social", "party", "night", "fest", "festival", "showcase"],
  networking: ["network", "networking", "meetup", "summit", "conference", "day", "devopsdays", "showcase", "container day", "devops"],
  design: ["design", "css", "frontend", "ux", "ui", "react", "frameworks", "routing"],
  funding: ["funding", "startup", "pitch", "pitching", "vc", "investor", "grant"],
};

export const norm = (v) => (v == null ? "" : String(v).toLowerCase());

export const getEventTagsLower = (ev) => {
  const candidates = [ev.tags, ev.event_tags, ev.tagNames, ev.tag_list];
  return candidates.flatMap((x) => (Array.isArray(x) ? x : [])).map(norm);
};
