-- RLS policy for public.facilities
-- Use this if Row Level Security is enabled and you want anonymous read access for the MVP.
-- Review security implications before applying.

-- Enable RLS (only if you intend to use policies)
-- alter table public.facilities enable row level security;

-- Allow anonymous users to SELECT facilities (read-only)
-- create policy allow_anon_select on public.facilities
--   for select
--   using (true);

-- If you later add ownership, replace the above with policies that enforce ownership.
