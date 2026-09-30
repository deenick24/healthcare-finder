import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment')
  process.exit(2)
}

const base = url.replace(/\/$/, '')

async function check(path, description){
  const endpoint = `${base}${path}`
  try{
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Accept: 'application/json'
      }
    })
    const text = await res.text()
    console.log(`\n[CHECK] ${description}`)
    console.log('URL:', endpoint)
    console.log('HTTP', res.status, res.statusText)
    console.log('Body:', text)
    return { status: res.status, ok: res.ok, body: text }
  }catch(err){
    console.error(`Network or fetch error for ${description}:`, err.message)
    return { status: 0, ok: false, body: String(err) }
  }
}

async function run(){
  // 1) basic reachability
  await check('/rest/v1/facilities?select=id&limit=1','basic facilities reachability')

  // 2) check columns exist (limit=0 to avoid returning rows)
  const cols = ['id','name','address','lga','state','phone','latitude','longitude','google_place_id','google_maps_url','services','verified','created_at','updated_at']
  await check(`/rest/v1/facilities?select=${cols.join(',')}&limit=0`,`columns check: ${cols.join(',')}`)

  // 3) check full table listing (may return rows)
  await check('/rest/v1/facilities?select=* &limit=5','sample list (up to 5)')

  process.exit(0)
}

run()
