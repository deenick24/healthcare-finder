-- Migration: create facilities table for Healthcare Finder MVP
-- Safe, idempotent migration. Run this in your Supabase SQL editor (do NOT run from frontend).
-- This migration will:
-- 1) create the `public.facilities` table if it does not exist
-- 2) create helpful indexes
-- 3) create a read-only RLS policy `allow_anon_select` if missing
-- 4) enable RLS on the table (after the policy is created)

-- Assumptions:
-- - The application expects a single table `public.facilities` matching the project's `Facility` type.
-- - Anonymous/public read access is acceptable for the MVP. The policy below only allows SELECT.

create extension if not exists "pgcrypto";

-- Create table if missing
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lga text not null,
  state text not null,
  phone text,
  latitude numeric,
  longitude numeric,
  google_place_id text,
  google_maps_url text,
  services text[] not null default '{}',
  verified boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for common filters (idempotent)
create index if not exists idx_facilities_state on public.facilities (state);
create index if not exists idx_facilities_lga on public.facilities (lga);

-- If a simple anonymous SELECT policy does not exist, create it.
-- We check pg_policies to avoid errors when re-running the migration.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'facilities' and policyname = 'allow_anon_select'
  ) then
    execute 'create policy allow_anon_select on public.facilities for select using (true);';
  end if;
end
$$;

-- Enable Row Level Security. If already enabled, this is a no-op.
alter table public.facilities enable row level security;

-- Notes:
-- - The policy above only permits SELECT for any role. It does NOT permit INSERT/UPDATE/DELETE.
-- - Review and tighten policies as needed before opening write access.

