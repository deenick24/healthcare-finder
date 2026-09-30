# Healthcare Finder

Minimal MVP to discover healthcare facilities across Akwa Ibom State.

Setup

1. Copy `.env.example` to `.env` and provide values for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GOOGLE_MAPS_API_KEY`.
2. Install dependencies: `npm install`.
3. Run dev server: `npm run dev`.

Notes

- The app uses Supabase to read from a `facilities` table. Ensure the table exists with the schema described in the project brief.
- Google Maps requires a valid API key with Maps JavaScript API enabled.
