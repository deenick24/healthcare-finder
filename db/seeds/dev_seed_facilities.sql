-- DEVELOPMENT / TEST SEED DATA FOR HEALTHCARE FINDER (DO NOT USE IN PRODUCTION)
-- Purpose: small set of clearly fake facilities to exercise frontend flows during development.
-- Run this in your Supabase SQL editor in your development environment only.

insert into public.facilities (name, address, lga, state, phone, latitude, longitude, services, verified)
values
  ('Dev General Hospital (TEST)', '1 Dev Health St, Uyo', 'Uyo', 'Akwa Ibom', '+2347000000001', 5.045, 7.926, array['General Practice','Emergency','Eye Care'], true),
  ('Dev Eye Clinic (TEST)', '2 Vision Rd, Eket', 'Eket', 'Akwa Ibom', null, 4.636, 7.928, array['Ophthalmology','Laser Surgery'], false),
  ('Dev Rural Health Post (TEST)', 'Village Rd, Abak', 'Abak', 'Akwa Ibom', '+2347000000003', null, null, array['Primary Care'], false)
;

-- Notes:
-- - These entries are clearly labeled ("DEV" / "TEST"). Do NOT run this in production.
-- - The third record intentionally omits latitude/longitude to test missing-coordinate handling.
