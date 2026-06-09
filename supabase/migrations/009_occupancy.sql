-- Roomward — Migration 009
-- Live room occupancy, synced from the PMS (RoomMaster). Answers the question
-- maintenance & housekeeping actually have before entering a room:
-- "Is there a guest in there right now?"
--   vacant    → no guest, clear to enter
--   occupied  → guest checked in, DO NOT enter
--   arriving  → checking in later today (clear now, but time-sensitive)
--   departing → checking out today (often clear after late morning)
-- Run AFTER 008.

alter table spaces add column if not exists occupancy text default 'vacant'
  check (occupancy in ('vacant','occupied','arriving','departing'));

create index if not exists idx_spaces_occupancy on spaces(occupancy);
