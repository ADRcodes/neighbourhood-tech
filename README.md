## Supabase-backed API layer

This app can talk directly to the Supabase Postgres database (with row-level security) instead of the legacy `VITE_API_URL` proxy.

1. Copy `.env.example` to `.env.local` (never commit secrets) and fill in your Supabase project values (`VITE_SUPABASE_URL` + the publishable key exposed as `VITE_SUPABASE_PUBLIC_KEY`; the legacy anon key still works as a fallback).
2. `npm install` now pulls in `@supabase/supabase-js`.
3. `src/lib/supabase/client.js` bootstraps the client. When the env vars are missing it gracefully falls back to the previous mock/API behaviour.

### Available helpers (`src/lib/api/supabase.js`)

| Area | Functions |
| --- | --- |
| Events | `listEvents`, `getEvent`, `createEvent`, `updateEvent`, `deleteEvent` |
| Venues/Organizers/Tags | `listVenues`, `createVenue`, `updateVenue`, `deleteVenue`, … |
| Event tags | `listTagsForEvent`, `attachTagsToEvent`, `detachTagFromEvent` |
| Saved events | `listSavedEvents`, `upsertSavedEvent`, `deleteSavedEvent` |
| User tag prefs | `listUserTagPreferences`, `addUserTagPreference`, `deleteUserTagPreference` |

All helpers respect RLS – authenticated calls inherit the current Supabase session. `src/lib/api/events.js` now auto-detects Supabase and normalizes the rows through `coerceEvent`, so `useEvents()` keeps working without code changes.

### Auth

`src/lib/auth/supabase.js` exposes:

- `useSupabaseSession()` – lightweight hook to track the active Supabase session.
- `signInWithPassword`, `signUpWithPassword`, `signOut`.

`/auth` now uses these helpers for email/password flows. When no Supabase env vars are present the screen shows a helpful warning instead of attempting the legacy REST endpoints.

### Saved events tab

`/saved` finally does something:

- Shows the visitor’s saved events (status + metadata) once they’re authenticated.
- Allows updating the status (`going`, `interested`, `not_interested`) or removing the save entirely.
- Redirects users to `/auth` if they need to sign in first.

#### Saved events schema contract

The frontend assumes Supabase exposes `public.saved_events` with the following columns + relationships:

- `id uuid primary key default gen_random_uuid()` (no foreign key relationship – Supabase generates it).
- `user_id uuid references auth.users(id) on delete cascade`.
- `event_id uuid references public.events(id) on delete cascade`.
- `status text` constrained by the API/UI (`interested`, `going`, `not_interested`).

All write helpers use Supabase’s `on conflict (user_id, event_id)` upsert, so each user maintains at most one row per event while letting the database enforce ownership.

> **Note:** The home feed now pulls events directly from Supabase. If any of the related tables (`venues`, `organizers`, `event_tags`, `tags`) are empty or locked down by RLS, the UI still renders the base event rows, but the related data will be blank. Make sure those tables are populated and readable for your authenticated users to see enriched metadata.

### Commands

```bash
npm install
npm run dev
npm run build
```

> **Node version:** Vite 7 prefers Node 20.19+ or 22.12+. Local Node 21 works with a warning, but upgrading is recommended for CI.
