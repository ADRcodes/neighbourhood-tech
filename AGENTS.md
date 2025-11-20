Love this. Here’s a repo-level “robots file” for coding agents—practical, opinionated, and tailored to how you like to work. Drop it at the repo root as `ROBOTS.md` (or `AGENTS.md` if you prefer).

---

# ROBOTS.md — How to work on this project (for coding agents & contributors)

## 0) TL;DR

* **Frontend**: Vite + React + Tailwind (tokens first: `bg-primary`, `text-onprimary`, etc.).
* **Mobile-first**: mobile and desktop both supported. Desktop uses a **3-rail grid**.
* **Components**: small, focused; hooks for data (`useEvents`) and utilities in `/lib/**`.
* **Style**: **use color tokens**, no hardcoded hex. Respect spacing and scroll behavior rules.
* **Don’t** break the carousel’s height sync, don’t reintroduce scrollbars on chip bars, and don’t output diffs in “- old / + new” format.
* **Ask when unsure**; default to small PRs with clear commit messages.

---

## 1) Tech & layout

* **Front end**: React (Vite), Tailwind v4+.
* **Design tokens**: declared in `@theme` (Tailwind). Use **semantic** utilities:

  * Colors: `bg-primary`, `bg-surface`, `text-text`, `text-text-muted`, `text-primary`, `text-onprimary`, `border-brand-200`, etc.
  * Never hardcode brand hex; do not bypass tokens with `[color:...]` unless truly necessary.
* **Routing**: React Router.
* **State/data**:

  * Use `useEvents()` (in `src/lib/hooks/useEvents.ts/tsx/js`). It handles **API vs mock**, chip filtering, and recommended lists.
  * API base: `VITE_API_URL`. When offline, `useEvents` falls back to mocks.

---

## 2) File structure (frontend)

```
src/
  components/
    EventCard.tsx
    EventList.tsx
    EventCarousel.tsx
    FeaturedGrid.tsx
    TagFilterBar.tsx
    TagList.tsx
    BottomNav.tsx
    DesktopNav.tsx
    Hero.tsx
  pages/
    Home2.tsx          # mobile layout
    HomeDesktop.tsx     # desktop 3-rail
    HomeShell.tsx       # chooses mobile vs desktop
  lib/
    hooks/
      useEvents.ts
    utils/
      tags.ts
      events.mock.ts
```

> Add new data helpers under `lib/`, not inside components.

---

## 3) Layout rules (important)

### Mobile

* **Carousel**: horizontal scroll, no visible scrollbar. Add **lead-in/out** spacing so first/last cards don’t glue to screen edges.
* **EventCard**: expandable *in place* with sliding panel. Summary keeps **title single-line** and **location 2-line clamp**; expanded unclamps location.

### Desktop (3-rail)

* Grid wrapper (don’t change):

  ```html
  <div class="
    grid gap-6 items-start
    md:grid-cols-2 lg:grid-cols-3
    md:[grid-template-columns:260px_1fr]
    lg:[grid-template-columns:280px_1fr_300px]
  ">
  ```
* Left rail: sticky filters (`TagList`, optional search).
* Main rail: Featured grid (2–3 cols), list below.
* Right rail: lightweight widgets (e.g., “Happening soon”, “Host your event”).

---

## 4) Styling & UX constraints

* **Tokens first**: `bg-primary text-onprimary`, `bg-surface text-text`, etc.
* **Buttons**: rounded, medium density, hover = slight opacity or shadow; focus rings from token `focus`.
* **Chip bars**: horizontal scroll with **hidden scrollbar**. Use CSS:

  ```css
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  ```
* **Carousel height sync**: cards should match the **largest measured collapsed height**. Don’t regress to mismatched heights.
* **EventList items**: title & venue **truncate** when collapsed; expand shows full text; collapsing restores the compact height baseline.

---

## 5) Components: do / don’t

**Do**

* Keep components ≤200–250 lines. Extract hooks/utilities as soon as logic grows.
* Make props explicit; prefer `onRegister`, `onToggle`, etc.
* Memoize expensive maps with `useMemo` and **include all deps** (fix `react-hooks/exhaustive-deps`).

**Don’t**

* Don’t hardcode colors or spacing outside tokens.
* Don’t use `position: fixed` for nav within the app shell; use the provided `BottomNav`/`DesktopNav`.
* Don’t introduce layout shifts by measuring expanded content for baseline heights.

---

## 6) Data & API

* Fetch through `useEvents()`; it normalizes shapes and supports mocks.
* **Environment**:

  * `VITE_API_URL` — backend origin
  * Never commit secrets. Use `.env.local`, `.env.development`, etc. `.env*` is git-ignored.

---

## 7) Commands & scripts

* **Dev**: `npm run dev`
* **Build**: `npm run build`
* **Preview**: `npm run preview`
* **Lint/format** (if configured): `npm run lint`, `npm run format`

---

## 8) Accessibility

* Buttons/links get discernible text.
* Proper `aria-expanded` on expandable cards.
* Color contrast is handled by tokens—**do not** alter token contrast locally.

---

## 9) Git & PRs

* Small, focused PRs (≤ ~300 LOC diff preferred).
* Commit style:

  * `feat(frontend): add desktop featured grid`
  * `fix(carousel): sync collapsed height across cards`
  * `style(tokens): replace hex with bg-primary`
* PR checklist:

  * [ ] No hex colors; tokens only
  * [ ] No visible scrollbars on chip carousels
  * [ ] Desktop grid renders 3 rails at `lg`
  * [ ] EventCard expands within carousel
  * [ ] ESLint/TypeScript clean (no unused vars)
  * [ ] Mobile still OK (iPhone 14/15 size)

---

## 10) Patterns to copy

**Desktop grid wrapper**

```jsx
<div className="
  grid gap-6 items-start
  md:grid-cols-2 lg:grid-cols-3
  md:[grid-template-columns:260px_1fr]
  lg:[grid-template-columns:280px_1fr_300px]
">
  <aside>…</aside>
  <main>…</main>
  <aside>…</aside>
</div>
```

**Primary CTA**

```jsx
<a className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold bg-primary text-onprimary hover:opacity-95">
  ＋ Create event
</a>
```

**Hidden scrollbar row**

```jsx
<div className="flex gap-4 overflow-x-auto no-scrollbar">…</div>
```

---

## 11) What not to change (without discussion)

* Brand token definitions and names.
* `HomeShell` responsibility (decides mobile vs. desktop).
* Carousel expand-in-place behavior.
* Env var contract (`VITE_API_URL`).

---

## 12) When in doubt

* Prefer tiny PRs, ask one clear question, and propose two options with **trade-offs**.
* If you must deviate from tokens or layout rules, **leave a short comment** explaining why and how to revert.

---

## 13) Contact / ownership

* Primary maintainer: Alex (prefers logical, example-driven explanations).
* Default stack: **Vite + Tailwind**, Mac dev env.
* Code lives at: `Users/alexrussell/Desktop/Coding` (local convention; do not hardcode paths in scripts).

---

End of file.
