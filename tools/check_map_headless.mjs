import puppeteer from 'puppeteer'

async function run(){
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']})
  const page = await browser.newPage()
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2', timeout: 15000 })
  // wait for app root
  await page.waitForSelector('#root, body', { timeout: 10000 })
  // wait up to 5s for leaflet container
  let leafletPresent = false
  try{
    await page.waitForSelector('.leaflet-container', { timeout: 5000 })
    leafletPresent = true
  }catch(e){ leafletPresent = false }
  const markers = await page.$$eval('.leaflet-marker-icon', m=>m.length)
  const userMarker = await page.$$eval('.user-location-marker', m=>m.length).catch(()=>0)
  console.log(JSON.stringify({leafletPresent, markers, userMarker}))
  await browser.close()
}

run().catch(e=>{ console.error(e); process.exit(1) })
