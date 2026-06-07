-- Roomward — Migration 008
-- No-card 14-day trial + Stripe subscription state on organizations.
-- Defaults mean every newly-created org automatically starts a 14-day trial —
-- no change needed to onboard_organization().
-- Run AFTER 007.

alter table organizations add column if not exists trial_ends_at timestamptz default (now() + interval '14 days');
alter table organizations add column if not exists subscription_status text default 'trial'
  check (subscription_status in ('trial','active','past_due','canceled'));
alter table organizations add column if not exists stripe_customer_id text;
alter table organizations add column if not exists stripe_subscription_id text;

-- The Amicalola demo org stays 'active' so the public demo never hits a paywall.
update organizations
  set subscription_status = 'active'
  where id = '00000000-0000-0000-0000-0000000000a1';

-- Anyone in the org can read its billing state; only admins/managers change plan-y fields
-- (covered by the existing "view own org" select policy + service-role for webhooks).
