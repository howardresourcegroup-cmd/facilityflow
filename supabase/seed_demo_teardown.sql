-- Roomward — Remove the demo seed (supabase/seed_demo.sql)
-- ────────────────────────────────────────────────────────────────────────────
-- Deletes ONLY the demo-tagged rows (fixed demo UUIDs + 'DEMO-' assets +
-- the 6 banned demo teammates). Your own org, account, and data are untouched.
-- Run in: Supabase dashboard → SQL Editor → Run.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_building uuid := 'd1000000-0000-0000-0000-0000000000b1';
  v_ch_general uuid := 'd1000000-0000-0000-0000-0000000000c1';
  v_ch_maint   uuid := 'd1000000-0000-0000-0000-0000000000c2';
  v_ch_hskp    uuid := 'd1000000-0000-0000-0000-0000000000c3';
  demo_users uuid[] := array[
    'd1000000-0000-0000-0000-0000000000e1',
    'd1000000-0000-0000-0000-0000000000e2',
    'd1000000-0000-0000-0000-0000000000e3',
    'd1000000-0000-0000-0000-0000000000e4',
    'd1000000-0000-0000-0000-0000000000e5',
    'd1000000-0000-0000-0000-0000000000e6'
  ];
begin
  delete from channels where id in (v_ch_general, v_ch_maint, v_ch_hskp);   -- cascades messages + members
  delete from work_orders where space_id in (
    select s.id from spaces s join floors f on f.id = s.floor_id where f.building_id = v_building
  );
  delete from buildings where id = v_building;                              -- cascades floors + spaces
  delete from assets where serial_number like 'DEMO-%';
  delete from auth.users where id = any(demo_users);                        -- cascades profiles
  raise notice 'Demo seed removed.';
end $$;
