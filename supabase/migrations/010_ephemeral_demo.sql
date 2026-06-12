-- Roomward — Migration 010
-- Ephemeral, isolated demo sandboxes.
--
-- Flow: visitor clicks "View live demo" → client calls supabase.auth.signInAnonymously()
-- → client calls rpc('start_demo') which creates a private, throwaway org seeded with a
-- compact property. On sign-out / tab-close the client calls rpc('end_demo'); an hourly
-- pg_cron sweep is the real guarantee — it deletes any demo org past demo_expires_at.
--
-- PREREQUISITES (do these in the Supabase dashboard):
--   1. Auth → Providers → enable "Anonymous Sign-ins".
--   2. Database → Extensions → enable "pg_cron" (for the TTL sweep).
-- Run this whole file in the SQL Editor.

-- ── Demo tagging on organizations ─────────────────────────────────────────────
alter table organizations add column if not exists is_demo boolean not null default false;
alter table organizations add column if not exists demo_expires_at timestamptz;
create index if not exists idx_org_demo_expiry on organizations(demo_expires_at) where is_demo;

-- ══════════════════════════════════════════════════════════════════════════════
--  Compact property seed for one demo org (called by start_demo)
-- ══════════════════════════════════════════════════════════════════════════════
create or replace function _seed_demo_property(p_org uuid, p_owner uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  v_building uuid := gen_random_uuid();
  v_f1 uuid := gen_random_uuid();
  v_f2 uuid := gen_random_uuid();
  u_maria uuid := gen_random_uuid();
  u_carlos uuid := gen_random_uuid();
  r_maint uuid; r_hskp uuid;
  tag text := replace(p_org::text, '-', '');
  fl record;
begin
  -- Two banned teammates so work orders have real assignees (cleaned up with the org).
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          banned_until, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values
    ('00000000-0000-0000-0000-000000000000', u_maria, 'authenticated','authenticated',
     format('maria+%s@demo.roomward.app', tag), '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Delgado"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', u_carlos,'authenticated','authenticated',
     format('carlos+%s@demo.roomward.app', tag), '', now(), 'infinity',
     '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Rivera"}', now(), now());

  select id into r_maint from roles where organization_id = p_org and slug = 'maintenance'  limit 1;
  select id into r_hskp  from roles where organization_id = p_org and slug = 'housekeeping' limit 1;
  update profiles set organization_id = p_org, role = 'manager',    role_id = r_hskp,  full_name = 'Maria Delgado', is_available = true  where id = u_maria;
  update profiles set organization_id = p_org, role = 'technician', role_id = r_maint, full_name = 'Carlos Rivera', is_available = true  where id = u_carlos;

  insert into buildings (id, organization_id, name, address, city, state, type)
  values (v_building, p_org, 'Grandview Demo Hotel', '500 Riverside Dr', 'Dawsonville', 'GA', 'hotel');

  insert into floors (id, building_id, name, level, grid_cols, grid_rows) values
    (v_f1, v_building, 'Floor 1', 1, 14, 7),
    (v_f2, v_building, 'Floor 2', 2, 14, 7);

  for fl in select * from (values (v_f1, 100), (v_f2, 200)) as t(fid, base)
  loop
    insert into spaces (floor_id, name, type, status, position_x, position_y, width, height, housekeeping_status, occupancy)
    select fl.fid, 'Room ' || (fl.base + i), 'guest_room',
      case when fl.base + i = 104 then 'emergency'
           when i in (2) then 'needs_maintenance'
           when i in (5) then 'cleaning_required'
           else 'operational' end,
      1 + ((i - 1) % 6) * 2, 1, 2, 2,
      case when i in (5) then 'dirty' when i = 3 then 'in_progress' when i = 6 then 'cleaned' else 'ready' end,
      case when i in (1,4) then 'occupied' when i = 2 then 'arriving' when i = 6 then 'departing' else 'vacant' end
    from generate_series(1, 6) as i;
  end loop;

  insert into assets (organization_id, name, type, model, serial_number, status, next_maintenance_at) values
    (p_org, 'Rooftop HVAC',       'HVAC',    'Carrier 50XC060', 'DEMO-HVAC', 'maintenance', now() + interval '2 days'),
    (p_org, 'Pool Pump — Main',   'Pool',    'Pentair IntelliFlo', 'DEMO-PUMP', 'operational', now() + interval '90 days');

  insert into work_orders (organization_id, space_id, created_by, assigned_to, title, description, status, priority, category, due_date, completed_at, created_at) values
    (p_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 104'),
      p_owner, u_carlos, 'No A/C — guest reports room not cooling', 'Thermostat unresponsive; room flagged for service.', 'in_progress', 'critical', 'hvac', now() + interval '4 hours', null, now() - interval '2 hours'),
    (p_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 105'),
      p_owner, u_maria, 'Deep clean before check-in', 'Turn the room before the 3pm arrival.', 'in_progress', 'medium', 'housekeeping', now() + interval '3 hours', null, now() - interval '1 hour'),
    (p_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 202'),
      p_owner, u_carlos, 'Leaky bathroom faucet', 'Needs a new cartridge on the hot side.', 'assigned', 'low', 'plumbing', now() + interval '2 days', null, now() - interval '5 hours'),
    (p_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 203'),
      p_owner, null, 'TV remote not pairing', 'Swap or re-pair the remote.', 'open', 'low', 'electrical', now() + interval '2 days', null, now() - interval '3 hours'),
    (p_org, (select s.id from spaces s join floors f on f.id=s.floor_id where f.building_id=v_building and s.name='Room 106'),
      p_owner, u_carlos, 'Replace burnt-out vanity bulb', 'One of three bulbs is out.', 'completed', 'low', 'electrical', now() - interval '1 day', now() - interval '20 hours', now() - interval '1 day');
end $$;

-- ══════════════════════════════════════════════════════════════════════════════
--  start_demo — create + seed a private demo org for the calling (anon) user
-- ══════════════════════════════════════════════════════════════════════════════
create or replace function start_demo()
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
  v_existing uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  -- Idempotent: if this user already has an org (e.g. double-click), reuse it.
  select organization_id into v_existing from profiles where id = v_uid;
  if v_existing is not null then return v_existing; end if;

  insert into organizations (name, slug, plan, is_demo, demo_expires_at)
  values ('Grandview Demo Hotel', 'demo-' || replace(v_uid::text, '-', ''), 'pro', true, now() + interval '24 hours')
  returning id into v_org;

  update profiles set organization_id = v_org, role = 'admin' where id = v_uid;

  -- Seed system roles for this org (mirrors onboarding), then the property.
  insert into roles (organization_id, name, slug, description, color, is_system) values
    (v_org, 'Administrator','admin','Full access','red',true),
    (v_org, 'Manager','manager','Runs operations','indigo',true),
    (v_org, 'Maintenance Tech','maintenance','Field technician','amber',true),
    (v_org, 'Housekeeping','housekeeping','Room cleaning','cyan',true),
    (v_org, 'Front Desk','front_desk','Guest issues','violet',true),
    (v_org, 'Viewer','viewer','Read-only','zinc',true);

  perform _seed_demo_property(v_org, v_uid);
  return v_org;
end $$;

-- ══════════════════════════════════════════════════════════════════════════════
--  Cleanup — delete one demo org and every account/row inside it
-- ══════════════════════════════════════════════════════════════════════════════
create or replace function _delete_demo_org(p_org uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
declare v_members uuid[];
begin
  if not exists (select 1 from organizations where id = p_org and is_demo) then return; end if;
  select array_agg(id) into v_members from profiles where organization_id = p_org;

  -- Order matters: clear FKs that would RESTRICT a profile delete, then the org
  -- (cascades buildings→floors→spaces, assets, profiles), then the auth users.
  delete from messages    where organization_id = p_org;
  delete from channels     where organization_id = p_org;
  delete from work_orders  where organization_id = p_org;
  delete from organizations where id = p_org;            -- cascades the rest incl. profiles
  if v_members is not null then
    delete from auth.users where id = any(v_members);     -- anon owner + banned teammates
  end if;
end $$;

-- Called by the client on sign-out / tab-close (best-effort, keyed to the caller).
create or replace function end_demo()
returns void language plpgsql security definer set search_path = public, auth as $$
declare v_org uuid;
begin
  select organization_id into v_org from profiles where id = auth.uid();
  if v_org is not null then perform _delete_demo_org(v_org); end if;
end $$;

-- The real guarantee: hourly sweep of anything past its TTL.
create or replace function sweep_expired_demos()
returns integer language plpgsql security definer set search_path = public, auth as $$
declare r record; n int := 0;
begin
  for r in select id from organizations where is_demo and demo_expires_at < now()
  loop
    perform _delete_demo_org(r.id); n := n + 1;
  end loop;
  return n;
end $$;

-- ── Grants: anonymous/authenticated users may start and end their own demo ─────
revoke all on function start_demo() from public;
revoke all on function end_demo()   from public;
grant execute on function start_demo() to authenticated;
grant execute on function end_demo()   to authenticated;
-- (_seed_demo_property, _delete_demo_org, sweep_expired_demos are internal — no grants.)

-- ── Schedule the hourly TTL sweep (requires pg_cron enabled) ───────────────────
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'sweep-expired-demos') then
      perform cron.unschedule('sweep-expired-demos');
    end if;
    perform cron.schedule('sweep-expired-demos', '0 * * * *', 'select sweep_expired_demos();');
  else
    raise notice 'pg_cron not enabled — enable it in Database → Extensions, then run: select cron.schedule(''sweep-expired-demos'', ''0 * * * *'', ''select sweep_expired_demos();'');';
  end if;
end $$;
