-- DEVELOPMENT / TEST SEED DATA FOR HEALTHCARE FINDER (DO NOT USE IN PRODUCTION)
-- Purpose: 20 clearly fictional demo facilities for local map and search testing.
-- Every row is labeled (DEMO), uses a fictional phone number, and uses demo coordinates.
-- Run this in the Supabase SQL editor in a development environment only.

insert into public.facilities (name, address, lga, state, phone, latitude, longitude, services, verified)
values
  ('Uyo Central Medical Centre (DEMO)', 'Demo Civic Way, Central Uyo', 'Uyo', 'Akwa Ibom', '0800-000-0001', 5.0331, 7.9284, array['General consultation','Emergency care','Pharmacy'], true),
  ('Akwa Ibom Family Clinic (DEMO)', 'Demo Family Crescent, Uyo', 'Uyo', 'Akwa Ibom', '0800-000-0002', 5.0478, 7.9132, array['Family medicine','Child health','Vaccination'], true),
  ('Shelter Afrique Diagnostic Centre (DEMO)', 'Demo Diagnostic Lane, Shelter Afrique', 'Uyo', 'Akwa Ibom', '0800-000-0003', 5.0126, 7.9561, array['Laboratory services','Diagnostic imaging','Health screening'], false),
  ('Itam Community Hospital (DEMO)', 'Demo Market Road, Itam', 'Itu', 'Akwa Ibom', '0800-000-0004', 5.0705, 7.9728, array['General consultation','Minor procedures','Emergency care'], true),
  ('Ewet Housing Clinic (DEMO)', 'Demo Estate Drive, Ewet Housing', 'Uyo', 'Akwa Ibom', '0800-000-0005', 5.0214, 7.9008, array['Primary care','Health screening','Vaccination'], false),
  ('Osongama Specialist Centre (DEMO)', 'Demo Specialist Avenue, Osongama', 'Uyo', 'Akwa Ibom', '0800-000-0006', 5.0637, 7.8896, array['Specialist consultation','Laboratory services','Pharmacy'], true),
  ('Ikot Ekpene Road Medical Clinic (DEMO)', 'Demo Roadside Close, Ikot Ekpene Road', 'Uyo', 'Akwa Ibom', '0800-000-0007', 5.0842, 7.9417, array['General consultation','Minor procedures','Pharmacy'], false),
  ('Udo Udoma Health Centre (DEMO)', 'Demo Community Street, Udo Udoma', 'Uyo', 'Akwa Ibom', '0800-000-0008', 5.0018, 7.9189, array['Primary care','Antenatal care','Child health'], true),
  ('Four Corners Maternity Centre (DEMO)', 'Demo Maternity Turn, Four Corners', 'Uyo', 'Akwa Ibom', '0800-000-0009', 5.0564, 7.9652, array['Maternal care','Antenatal care','Child health'], true),
  ('Stadium Road Medical Centre (DEMO)', 'Demo Stadium Link, Stadium Road', 'Uyo', 'Akwa Ibom', '0800-000-0010', 5.0395, 7.8914, array['General consultation','Health screening','Minor procedures'], false),
  ('Abak Road Diagnostic Hub (DEMO)', 'Demo Diagnostic Park, Abak Road', 'Uyo', 'Akwa Ibom', '0800-000-0011', 5.0182, 7.8756, array['Diagnostic imaging','Laboratory services','Health screening'], true),
  ('Aka Road Family Health Centre (DEMO)', 'Demo Family Court, Aka Road', 'Uyo', 'Akwa Ibom', '0800-000-0012', 5.0741, 7.9198, array['Family medicine','General consultation','Vaccination'], false),
  ('Use Offot Community Clinic (DEMO)', 'Demo Community Path, Use Offot', 'Uyo', 'Akwa Ibom', '0800-000-0013', 5.0946, 7.9071, array['Primary care','Child health','Health screening'], true),
  ('Ibiono Community Medical Centre (DEMO)', 'Demo District Road, Ibiono', 'Ibiono Ibom', 'Akwa Ibom', '0800-000-0014', 5.2265, 7.9378, array['General healthcare','Antenatal care','Pharmacy'], false),
  ('Airport Road Medical Centre (DEMO)', 'Demo Airfield Approach, Airport Road', 'Uyo', 'Akwa Ibom', '0800-000-0015', 5.0111, 7.9864, array['General consultation','Emergency care','Pharmacy'], true),
  ('Ring Road Specialist Clinic (DEMO)', 'Demo Circle Boulevard, Ring Road', 'Uyo', 'Akwa Ibom', '0800-000-0016', 5.0489, 7.9686, array['Specialist consultation','Diagnostic imaging','Minor procedures'], false),
  ('Shelter Afrique Children''s Clinic (DEMO)', 'Demo Children''s Walk, Shelter Afrique', 'Uyo', 'Akwa Ibom', '0800-000-0017', 5.0068, 7.9475, array['Paediatrics','Child health','Vaccination'], true),
  ('Oron Road Women''s Health Centre (DEMO)', 'Demo Women''s Care Road, Oron Road', 'Uyo', 'Akwa Ibom', '0800-000-0018', 4.9827, 7.9543, array['Women''s health','Maternal care','Health screening'], false),
  ('Nwaniba Road Emergency Clinic (DEMO)', 'Demo Urgent Care Bend, Nwaniba Road', 'Uyo', 'Akwa Ibom', '0800-000-0019', 5.0776, 7.9951, array['Emergency care','Urgent care','Minor procedures'], true),
  ('University District Health Centre (DEMO)', 'Demo Student Health Way, University District', 'Uyo', 'Akwa Ibom', '0800-000-0020', 5.1264, 7.9325, array['General consultation','Student health','Vaccination'], false)
;

-- Verification queries: run after the insert in the development database.
select id, name, lga, latitude, longitude, services, verified
from public.facilities
where name like '%(DEMO)'
order by created_at asc;

select
  count(*) as demo_facility_count,
  count(*) filter (where latitude is not null and longitude is not null) as demo_facilities_with_coordinates,
  count(*) filter (where verified) as verified_demo_facilities,
  count(*) filter (where not verified) as unverified_demo_facilities,
  count(*) filter (where cardinality(services) > 0) as demo_facilities_with_services
from public.facilities
where name like '%(DEMO)';