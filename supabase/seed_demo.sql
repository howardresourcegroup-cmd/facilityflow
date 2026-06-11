-- Roomward — Demo seed for marketing screenshots
-- ────────────────────────────────────────────────────────────────────────────
-- Populates ONE polished property ("Blue Ridge Grand Hotel") in YOUR org so the
-- app looks alive in screenshots: a full floor plan with color-coded rooms,
-- a realistic team, work orders in every state, a housekeeping board, assets,
-- and team chat.
--
-- HOW TO RUN
--   Supabase dashboard → SQL Editor → paste this whole file → Run.
--   (It runs as the service role there, so RLS does not get in the way.)
--   Re-running is safe: it wipes the prior demo run first and rebuilds it.
--
-- WHAT IT TOUCHES
--   It targets the org of your earliest real account and adds data tagged with
--   fixed demo UUIDs / 'DEMO-' markers. It never edits or deletes your own rows.
--
-- TO REMOVE IT LATER
--   Run supabase/seed_demo_teardown.sql.
--
-- SECURITY NOTE
--   The 6 teammates are auth.users with banned_until = 'infinity' and no usable
--   password — they appear in the UI but can never sign in. The teardown removes
--   them entirely.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  -- Fixed demo identifiers (used for clean idempotent teardown) ───────────────
  v_building uuid := 'd1000000-0000-0000-0000-0000000000b1';
  v_f1 uuid := 'd1000000-0000-0000-0000-0000000000f1'; -- ground
  v_f2 uuid := 'd1000000-0000-0000-0000-0000000000f2'; -- floor 2
  v_f3 uuid := 'd1000000-0000-0000-0000-0000000000f3'; -- floor 3
  v_f4 uuid := 'd1000000-0000-0000-0000-0000000000f4'; -- floor 4
  v_ch_general uuid := 'd1000000-0000-0000-0000-0000000000c1';
  v_ch_maint   uuid := 'd1000000-0000-0000-0000-0000000000c2';
  v_ch_hskp    uuid := 'd1000000-0000-0000-0000-0000000000c3';
  -- Teammate auth.user ids
  u_maria  uuid := 'd1000000-0000-0000-0000-0000000000e1';
  u_carlos uuid := 'd1000000-0000-0000-0000-0000000000e2';
  u_james  uuid := 'd1000000-0000-0000-0000-0000000000e3';
  u_priya  uuid := 'd1000000-0000-0000-0000-0000000000e4';
  u_tom    uuid := 'd1000000-0000-0000-0000-0000000000e5';
  u_sarah  uuid := 'd1000000-0000-0000-0000-0000000000e6';
  demo_users uuid[] := array[u_maria,u_carlos,u_james,u_priya,u_tom,u_sarah];

  v_org   uuid;
  v_admin uuid;
  r_manager uuid; r_maint uuid; r_hskp uuid; r_front uuid;
  fl record;
begin
  -- ── Resolve YOUR org + an admin profile to own the demo work orders ─────────
  select organization_id into v_org
  from profiles
  where organization_id is not null and id <> all(demo_users)
  order by created_at asc
  limit 1;

  if v_org is null then
    raise exception 'No real account/org found. Sign up and create your workspace first, then re-run this seed.';
  end if;

  select id into v_admin
  from profiles
  where organization_id = v_org and id <> all(demo_users)
  order by (role = 'admin') desc, created_at asc
  limit 1;

  -- ── Wipe any prior demo run (only ever touches demo-tagged rows) ────────────
  delete from channels where id in (v_ch_general, v_ch_maint, v_ch_hskp);      -- cascades messages + members
  delete from work_orders where space_id in (
    select s.id from spaces s join floors f on f.id = s.floor_id where f.building_id = v_building
  );
  delete from buildings where id = v_building;                                 -- cascades floors + spaces
  delete from assets where organization_id = v_org and serial_number like 'DEMO-%';
  delete from auth.users where id = any(demo_users);                           -- cascades profiles

  -- Look up the org's system roles (best-effort; legacy text role still works)
  select id into r_manager from roles where organization_id = v_org and slug = 'manager'      limit 1;
  select id into r_maint   from roles where organization_id = v_org and slug = 'maintenance'  limit 1;
  select id into r_hskp    from roles where organization_id = v_org and slug = 'housekeeping' limit 1;
  select id into r_front   from roles where organization_id = v_org and slug = 'front_desk'   limit 1;

  -- ── Teammates: real auth.users, permanently banned, no usable password ──────
  insert into auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
     banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000', u_maria,  'authenticated','authenticated','maria@blueridgegrand.com',  '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Delgado"}',   now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_carlos, 'authenticated','authenticated','carlos@blueridgegrand.com', '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Rivera"}',   now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_james,  'authenticated','authenticated','james@blueridgegrand.com',  '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"James Chen"}',      now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_priya,  'authenticated','authenticated','priya@blueridgegrand.com',  '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Nair"}',      now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_tom,    'authenticated','authenticated','tom@blueridgegrand.com',    '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"Tom Walker"}',      now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_sarah,  'authenticated','authenticated','sarah@blueridgegrand.com',  '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Kim"}',       now(), now());
  -- handle_new_user() auto-created their profiles; now place them in the org + role.
  update profiles set organization_id = v_org, role = 'manager',    role_id = r_hskp,  phone = '(706) 555-0142', is_available = true  where id = u_maria;
  update profiles set organization_id = v_org, role = 'technician', role_id = r_maint, phone = '(706) 555-0118', is_available = true  where id = u_carlos;
  update profiles set organization_id = v_org, role = 'technician', role_id = r_maint, phone = '(706) 555-0173', is_available = false where id = u_james;
  update profiles set organization_id = v_org, role = 'viewer',     role_id = r_front, phone = '(706) 555-0150', is_available = true  where id = u_priya;
  update profiles set organization_id = v_org, role = 'technician', role_id = r_maint, phone = '(706) 555-0191', is_available = true  where id = u_tom;
  update profiles set organization_id = v_org, role = 'manager',    role_id = r_manager,phone = '(706) 555-0107', is_available = true where id = u_sarah;

  -- ── Building + floors ───────────────────────────────────────────────────────
  insert into buildings (id, organization_id, name, address, city, state, type)
  values (v_building, v_org, 'Blue Ridge Grand Hotel', '120 Highland Ridge Pkwy', 'Dawsonville', 'GA', 'hotel');

  insert into floors (id, building_id, name, level, grid_cols, grid_rows) values
    (v_f1, v_building, 'Ground Floor', 1, 14, 7),
    (v_f2, v_building, 'Floor 2',      2, 14, 7),
    (v_f3, v_building, 'Floor 3',      3, 14, 7),
    (v_f4, v_building, 'Floor 4',      4, 14, 7);

  -- ── Ground-floor common spaces ──────────────────────────────────────────────
  insert into spaces (floor_id, name, type, status, position_x, position_y, width, height, housekeeping_status, occupancy) values
    (v_f1, 'Lobby',              'common',     'operational',       1, 1, 4, 3, 'ready',         'vacant'),
    (v_f1, 'Front Desk',         'common',     'operational',       5, 1, 2, 2, 'ready',         'vacant'),
    (v_f1, 'Restaurant',         'common',     'operational',       7, 1, 4, 3, 'ready',         'vacant'),
    (v_f1, 'Commercial Kitchen', 'kitchen',    'needs_maintenance', 11,1, 3, 2, 'ready',         'vacant'),
    (v_f1, 'Pool',               'amenity',    'operational',       1, 4, 3, 3, 'ready',         'vacant'),
    (v_f1, 'Fitness Center',     'amenity',    'cleaning_required', 4, 4, 3, 2, 'dirty',         'vacant'),
    (v_f1, 'Mechanical Room',    'mechanical', 'operational',       7, 4, 3, 2, 'ready',         'vacant'),
    (v_f1, 'Laundry Room',       'mechanical', 'operational',       10,4, 4, 2, 'ready',         'vacant');

  -- ── Guest rooms (floors 2–4, 12 rooms each) ─────────────────────────────────
  for fl in select * from (values (v_f2, 200), (v_f3, 300), (v_f4, 400)) as t(fid, base)
  loop
    insert into spaces (floor_id, name, type, status, position_x, position_y, width, height, housekeeping_status, occupancy)
    select
      fl.fid,
      'Room ' || (fl.base + i),
      'guest_room',
      case
        when fl.base + i = 304 then 'emergency'
        when fl.base + i = 212 then 'offline'
        when i in (3, 9)  then 'needs_maintenance'
        when i in (5, 11) then 'cleaning_required'
        else 'operational'
      end,
      1 + ((i - 1) % 6) * 2,
      case when i <= 6 then 1 else 4 end,
      2, 2,
      case
        when fl.base + i = 212 then 'out_of_service'
        when i in (5, 11) then 'dirty'
        when i = 3 then 'in_progress'
        when i = 9 then 'cleaned'
        else 'ready'
      end,
      case
        when i in (1, 2, 6, 8, 10) then 'occupied'
        when i in (4, 12) then 'arriving'
        when i = 7 then 'departing'
        else 'vacant'
      end
    from generate_series(1, 12) as i;
  end loop;

  -- ── Assets (tagged DEMO- for clean teardown) ────────────────────────────────
  insert into assets (organization_id, space_id, name, type, model, serial_number, status, next_maintenance_at) values
    (v_org, (select id from spaces where floor_id=v_f1 and name='Mechanical Room'),    'Rooftop HVAC — North',  'HVAC',       'Carrier 50XC060',     'DEMO-CC-0441', 'operational', now() + interval '72 days'),
    (v_org, (select id from spaces where floor_id=v_f1 and name='Mechanical Room'),    'Rooftop HVAC — South',  'HVAC',       'Carrier 50XC060',     'DEMO-CC-0442', 'maintenance', now() + interval '2 days'),
    (v_org, (select id from spaces where floor_id=v_f1 and name='Commercial Kitchen'), 'Commercial Dishwasher', 'Kitchen',    'Hobart AM15',         'DEMO-HB-9823', 'degraded',    now() - interval '3 days'),
    (v_org, (select id from spaces where floor_id=v_f1 and name='Pool'),               'Pool Pump — Main',      'Pool',       'Pentair IntelliFlo',  'DEMO-PF-0123', 'operational', now() + interval '110 days'),
    (v_org, (select id from spaces where floor_id=v_f1 and name='Mechanical Room'),    'Emergency Generator',   'Electrical', 'Generac QT150',       'DEMO-GN-7712', 'operational', now() + interval '45 days'),
    (v_org, null,                                                                       'Elevator — Unit 1',     'Elevator',   'Otis Gen2',           'DEMO-OT-0451', 'operational', now() + interval '88 days'),
    (v_org, (select id from spaces where floor_id=v_f1 and name='Laundry Room'),       'Boiler — Hot Water',    'Plumbing',   'Lochinvar Knight 85', 'DEMO-LK-1003', 'operational', now() + interval '30 days'),
    (v_org, (select id from spaces where floor_id=v_f1 and name='Laundry Room'),       'Laundry Washer x3',     'Laundry',    'Maytag MHN33PD',      'DEMO-MW-3001', 'operational', now() + interval '64 days');

  -- ── Work orders — every status, assigned across the team ────────────────────
  -- Helper: rooms referenced by name within this building.
  insert into work_orders (organization_id, space_id, created_by, assigned_to, title, description, status, priority, category, due_date, completed_at, created_at) values
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 304'),
      v_admin, u_carlos, 'No A/C — guest reports room not cooling', 'Guest in 304 reports the unit is blowing warm air. Thermostat unresponsive. Guest relocated; room flagged emergency.', 'in_progress', 'critical', 'hvac', now() + interval '4 hours', null, now() - interval '2 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Commercial Kitchen'),
      v_admin, u_tom, 'Dishwasher leaking at door seal', 'Standing water under the AM15. Likely perished door gasket — ordered, awaiting delivery.', 'waiting_parts', 'high', 'plumbing', now() + interval '2 days', null, now() - interval '1 day'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 209'),
      v_admin, u_james, 'Bathroom faucet drips', 'Slow but constant drip on the hot side. Needs a new cartridge.', 'assigned', 'low', 'plumbing', now() + interval '3 days', null, now() - interval '6 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 203'),
      v_admin, u_carlos, 'TV remote not pairing', 'Replaced batteries, still no response. Try re-pairing or swap remote.', 'open', 'low', 'electrical', now() + interval '2 days', null, now() - interval '3 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Fitness Center'),
      v_admin, u_maria, 'Deep clean after spill', 'Protein shake spilled across the mat area. Needs a full clean before reopening.', 'in_progress', 'medium', 'housekeeping', now() + interval '6 hours', null, now() - interval '90 minutes'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 311'),
      v_admin, u_james, 'Peeling paint near window', 'Moisture has lifted the paint below the window sill. Scrape, prime, repaint.', 'open', 'low', 'general', now() + interval '5 days', null, now() - interval '5 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Mechanical Room'),
      v_admin, u_tom, 'Quarterly generator load test', 'Run scheduled load test and log readings for the Generac QT150.', 'open', 'medium', 'electrical', now() + interval '4 days', null, now() - interval '8 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 405'),
      v_admin, u_carlos, 'Door lock battery low', 'Keypad flashing low-battery. Swap the AAs and re-test the guest card.', 'assigned', 'medium', 'general', now() + interval '1 day', null, now() - interval '4 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 210'),
      v_admin, u_carlos, 'Replace burnt-out vanity bulb', 'One of three vanity bulbs is out.', 'completed', 'low', 'electrical', now() - interval '1 day', now() - interval '20 hours', now() - interval '1 day'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Pool'),
      v_admin, u_tom, 'Balance pool chemicals', 'Morning reading was low on chlorine. Dose and re-test in 2 hours.', 'completed', 'medium', 'general', now() - interval '2 days', now() - interval '44 hours', now() - interval '2 days'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 207'),
      v_admin, u_james, 'Squeaky closet door', 'Hinges need oiling — guest noted it on checkout.', 'completed', 'low', 'general', now() - interval '3 days', now() - interval '70 hours', now() - interval '3 days'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Lobby'),
      v_admin, u_maria, 'Spot-clean lobby entry rug', 'Tracked-in mud near the main doors after the rain.', 'completed', 'low', 'housekeeping', now() - interval '1 day', now() - interval '22 hours', now() - interval '26 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 402'),
      v_admin, u_james, 'Wobbly desk chair', 'Caster loose on the desk chair, may need replacing.', 'open', 'low', 'general', now() + interval '6 days', null, now() - interval '7 hours'),
    (v_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 305'),
      v_admin, u_maria, 'Stayover clean requested early', 'Guest requested mid-stay refresh before 1pm.', 'in_progress', 'medium', 'housekeeping', now() + interval '3 hours', null, now() - interval '40 minutes');

  -- ── Team chat ───────────────────────────────────────────────────────────────
  insert into channels (id, organization_id, name, description, created_by) values
    (v_ch_general, v_org, 'general',      'Team-wide updates',            v_admin),
    (v_ch_maint,   v_org, 'maintenance',  'Engineering & repairs',        v_admin),
    (v_ch_hskp,    v_org, 'housekeeping', 'Room status & cleaning crew',  v_admin);

  insert into channel_members (channel_id, user_id)
  select c.id, p.id
  from (values (v_ch_general),(v_ch_maint),(v_ch_hskp)) as c(id)
  cross join (select unnest(array[v_admin] || demo_users) as id) as p
  where p.id is not null
  on conflict do nothing;

  insert into messages (channel_id, organization_id, author_id, body, created_at) values
    (v_ch_maint, v_org, u_sarah,  '304 is flagged critical — guest moved to 318. Carlos can you take a look this morning?', now() - interval '110 minutes'),
    (v_ch_maint, v_org, u_carlos, 'On it. Thermostat is dead, checking the unit on the roof now.', now() - interval '95 minutes'),
    (v_ch_maint, v_org, u_tom,    'Dishwasher gasket is in — should arrive tomorrow. Holding that ticket till then.', now() - interval '80 minutes'),
    (v_ch_hskp,  v_org, u_maria,  'Floor 2 is turned except 209 (maintenance hold). Starting Floor 3 now.', now() - interval '60 minutes'),
    (v_ch_hskp,  v_org, u_priya,  'Two early arrivals for 204 and 212 — can we prioritize those?', now() - interval '50 minutes'),
    (v_ch_hskp,  v_org, u_maria,  '212 is out of service, front desk is reassigning. 204 will be ready in 20.', now() - interval '45 minutes'),
    (v_ch_general,v_org, u_sarah, 'Great push this morning, team. 96% of rooms operational heading into check-in. 🙌', now() - interval '30 minutes');

  raise notice 'Demo seed complete for org %.', v_org;
end $$;
