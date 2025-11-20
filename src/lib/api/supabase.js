import { requireSupabase } from "../supabase/client";

async function run(query) {
  const { data, error } = await query;
  if (error) {
    console.error("[Supabase] request failed", error);
    const err = new Error(error.message || "Unexpected Supabase error");
    if (error.code) err.code = error.code;
    if (error.details) err.details = error.details;
    if (error.hint) err.hint = error.hint;
    throw err;
  }
  return data;
}

/* -------------------------------------------------------------------------- */
/*                                    Events                                  */
/* -------------------------------------------------------------------------- */

function partitionIds(rows, key) {
  const set = new Set();
  rows.forEach((row) => {
    const value = row?.[key];
    if (value) set.add(value);
  });
  return Array.from(set);
}

async function hydrateEvents(client, events, { signal } = {}) {
  if (!Array.isArray(events) || events.length === 0) return events ?? [];

  const eventIds = partitionIds(events, "id");
  const venueIds = partitionIds(events, "venue_id");
  const organizerIds = partitionIds(events, "organizer_id");

  try {
    const [venues, organizers, eventTagRows] = await Promise.all([
      venueIds.length
        ? run(client.from("venues").select("*", { signal }).in("id", venueIds))
        : Promise.resolve([]),
      organizerIds.length
        ? run(client.from("organizers").select("*", { signal }).in("id", organizerIds))
        : Promise.resolve([]),
      eventIds.length
        ? run(
            client.from("event_tags").select("id,event_id,tag_id", { signal }).in("event_id", eventIds)
          )
        : Promise.resolve([]),
    ]);

    const tagIds = partitionIds(eventTagRows, "tag_id");
    const tagRows = tagIds.length
      ? await run(client.from("tags").select("*", { signal }).in("id", tagIds))
      : [];
    const tagById = new Map(tagRows.map((tag) => [tag.id, tag]));

    const venueById = new Map(venues.map((v) => [v.id, v]));
    const organizerById = new Map(organizers.map((o) => [o.id, o]));
    const tagsByEvent = new Map();
    eventTagRows.forEach((row) => {
      if (!row?.event_id) return;
      const list = tagsByEvent.get(row.event_id) ?? [];
      list.push({ ...row, tag: tagById.get(row.tag_id) ?? null });
      tagsByEvent.set(row.event_id, list);
    });

    return events.map((event) => ({
      ...event,
      venue: event.venue ?? venueById.get(event.venue_id) ?? null,
      organizer: event.organizer ?? organizerById.get(event.organizer_id) ?? null,
      event_tags: event.event_tags ?? tagsByEvent.get(event.id) ?? [],
    }));
  } catch (error) {
    console.warn("Failed to hydrate related data for events; falling back to base rows", error);
    return events;
  }
}

export async function listEvents({ filters = {}, signal } = {}) {
  const client = requireSupabase();
  let query = client.from("events").select("*", { signal }).order("date", {
    ascending: true,
    nullsFirst: false,
  });

  if (filters.dateFrom) {
    query = query.gte("date", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("date", filters.dateTo);
  }
  if (filters.venueId) {
    query = query.eq("venue_id", filters.venueId);
  }
  if (filters.organizerId) {
    query = query.eq("organizer_id", filters.organizerId);
  }
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }
  if (typeof filters.limit === "number") {
    query = query.limit(filters.limit);
  }

  const rows = await run(query);
  return hydrateEvents(client, rows, { signal });
}

export async function getEvent(id, { signal } = {}) {
  const client = requireSupabase();
  const query = client.from("events").select("*", { signal }).eq("id", id).single();

  const event = await run(query);
  const [hydrated] = await hydrateEvents(client, [event], { signal });
  return hydrated ?? null;
}

export async function createEvent(payload) {
  const client = requireSupabase();
  const query = client.from("events").insert(payload).select("*").single();
  const created = await run(query);
  const [hydrated] = await hydrateEvents(client, [created]);
  return hydrated ?? created;
}

export async function updateEvent(id, updates) {
  const client = requireSupabase();
  const query = client.from("events").update(updates).eq("id", id).select("*").single();
  const updated = await run(query);
  const [hydrated] = await hydrateEvents(client, [updated]);
  return hydrated ?? updated;
}

export async function deleteEvent(id) {
  const client = requireSupabase();
  await run(client.from("event_tags").delete().eq("event_id", id));
  const query = client.from("events").delete().eq("id", id).select().single();
  return run(query);
}

/* -------------------------------------------------------------------------- */
/*                                   Venues                                   */
/* -------------------------------------------------------------------------- */

export const listVenues = () => run(requireSupabase().from("venues").select("*").order("name"));

export const getVenue = (id) =>
  run(requireSupabase().from("venues").select("*").eq("id", id).single());

export const createVenue = (payload) =>
  run(requireSupabase().from("venues").insert(payload).select("*").single());

export const updateVenue = (id, updates) =>
  run(requireSupabase().from("venues").update(updates).eq("id", id).select("*").single());

export const deleteVenue = (id) =>
  run(requireSupabase().from("venues").delete().eq("id", id).select().single());

/* -------------------------------------------------------------------------- */
/*                                 Organizers                                 */
/* -------------------------------------------------------------------------- */

export const listOrganizers = () =>
  run(requireSupabase().from("organizers").select("*").order("name"));

export const createOrganizer = (payload) =>
  run(requireSupabase().from("organizers").insert(payload).select("*").single());

export const updateOrganizer = (id, updates) =>
  run(requireSupabase().from("organizers").update(updates).eq("id", id).select("*").single());

export const deleteOrganizer = (id) =>
  run(requireSupabase().from("organizers").delete().eq("id", id).select().single());

/* -------------------------------------------------------------------------- */
/*                                    Tags                                    */
/* -------------------------------------------------------------------------- */

export const listTags = () => run(requireSupabase().from("tags").select("*").order("name"));

export const createTag = (payload) =>
  run(requireSupabase().from("tags").insert(payload).select("*").single());

export const deleteTag = (id) =>
  run(requireSupabase().from("tags").delete().eq("id", id).select().single());

/* -------------------------------------------------------------------------- */
/*                                 Event Tags                                 */
/* -------------------------------------------------------------------------- */

export const listTagsForEvent = (eventId) =>
  run(
    requireSupabase()
      .from("event_tags")
      .select("*, tag:tags(*)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
  );

export const attachTagsToEvent = (eventId, tagIds = []) => {
  if (!Array.isArray(tagIds) || tagIds.length === 0) return Promise.resolve([]);
  const rows = tagIds.map((tagId) => ({ event_id: eventId, tag_id: tagId }));
  return run(requireSupabase().from("event_tags").insert(rows).select("*, tag:tags(*)"));
};

export const detachTagFromEvent = (eventId, tagId) =>
  run(
    requireSupabase()
      .from("event_tags")
      .delete()
      .eq("event_id", eventId)
      .eq("tag_id", tagId)
      .select()
      .single()
  );

/* -------------------------------------------------------------------------- */
/*                                Saved Events                                */
/* -------------------------------------------------------------------------- */

export const listSavedEvents = async (userId) => {
  const client = requireSupabase();
  const rows = await run(
    client
      .from("saved_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  );

  const eventIds = partitionIds(rows, "event_id");
  if (!eventIds.length) return rows;

  const events = await run(client.from("events").select("*").in("id", eventIds));
  const hydrated = await hydrateEvents(client, events);
  const eventById = new Map(hydrated.map((event) => [event.id, event]));

  return rows.map((row) => ({ ...row, event: eventById.get(row.event_id) ?? null }));
};

export const listEventPreferences = (userId) =>
  run(
    requireSupabase()
      .from("saved_events")
      .select("event_id,status")
      .eq("user_id", userId)
  );

export const upsertSavedEvent = ({ userId, eventId, status = "interested" }) =>
  run(
    requireSupabase()
      .from("saved_events")
      .upsert({ user_id: userId, event_id: eventId, status }, { onConflict: "user_id,event_id" })
      .select("*")
      .single()
  );

export const deleteSavedEvent = ({ userId, eventId }) =>
  run(
    requireSupabase()
      .from("saved_events")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .select()
      .single()
  );

/* -------------------------------------------------------------------------- */
/*                            User Tag Preferences                             */
/* -------------------------------------------------------------------------- */

export const listUserTagPreferences = (userId) =>
  run(
    requireSupabase()
      .from("user_tag_preferences")
      .select("*, tag:tags(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
  );

export const addUserTagPreference = ({ userId, tagId }) =>
  run(
    requireSupabase()
      .from("user_tag_preferences")
      .insert({ user_id: userId, tag_id: tagId })
      .select("*, tag:tags(*)")
      .single()
  );

export const deleteUserTagPreference = ({ userId, tagId }) =>
  run(
    requireSupabase()
      .from("user_tag_preferences")
      .delete()
      .eq("user_id", userId)
      .eq("tag_id", tagId)
      .select()
      .single()
  );
