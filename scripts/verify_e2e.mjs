import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(2)
}

const base = url.replace(/\/$/, '')

async function fetchAll(){
  const endpoint = `${base}/rest/v1/facilities?select=*&order=created_at.asc`
  const res = await fetch(endpoint, { headers: { apikey: anon, Authorization: `Bearer ${anon}`, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`fetch error ${res.status}`)
  return res.json()
}

function frontendFilter(facilities, query){
  const q = (query||'').trim().toLowerCase()
  if (!q) return facilities
  return facilities.filter(f => (f.services || []).some(s => String(s).toLowerCase().includes(q)))
}

async function run(){
  try{
    const facilities = await fetchAll()
    console.log('Found facilities:', facilities.length)

    // Basic expectations
    if (facilities.length === 0) {
      console.log('FAIL: no seeded facilities found')
      process.exit(1)
    }

    // Check fields presence
    for (const f of facilities){
      if (!f.id || !f.name || !f.address || !f.lga || !f.state) {
        console.error('FAIL: required field missing on', f)
        process.exit(1)
      }
      if (!Array.isArray(f.services)) {
        console.error('FAIL: services must be an array on', f.id)
        process.exit(1)
      }
    }
    console.log('PASS: required fields present and services is array')

    // Test search
    const q1 = 'eye'
    const res1 = frontendFilter(facilities, q1)
    console.log(`Search '${q1}' matched ${res1.length} facilities`) 

    const q2 = 'nonexistent-term-xyz'
    const res2 = frontendFilter(facilities, q2)
    console.log(`Search '${q2}' matched ${res2.length} facilities (expected 0)`) 

    // Test missing phone handling
    const missingPhone = facilities.filter(f => !f.phone)
    console.log('Facilities missing phone count:', missingPhone.length)

    // Test missing coordinates handling
    const missingCoords = facilities.filter(f => f.latitude == null || f.longitude == null)
    console.log('Facilities missing coordinates count:', missingCoords.length)

    // Show a sample facility details
    const sample = facilities[0]
    console.log('Sample facility details:', {
      id: sample.id,
      name: sample.name,
      address: sample.address,
      phone: sample.phone || 'MISSING',
      services: sample.services,
      latitude: sample.latitude,
      longitude: sample.longitude,
    })

    console.log('\nE2E verification completed successfully')
    process.exit(0)
  }catch(err){
    console.error('E2E verification failed:', err.message)
    process.exit(2)
  }
}

run()
