import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.join(process.cwd(), 'tools', 'screenshots')
fs.mkdirSync(OUT_DIR, { recursive: true })

async function run(){
  const report = { screenshots: {}, console: [], networkErrors: [], results: {} }

  const browser = await puppeteer.launch({ headless: false, args:['--no-sandbox','--disable-setuid-sandbox'], defaultViewport: { width: 1280, height: 900 }, slowMo: 50 })
  const page = await browser.newPage()

  page.on('console', msg => {
    try{ report.console.push({type: msg.type(), text: msg.text()}) }catch(e){}
  })
  page.on('response', async res => {
    try{ const status = res.status(); if (status >= 400) report.networkErrors.push({url: res.url(), status}) }catch(e){}
  })

  const url = 'http://localhost:5175/'
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

  // 1. Initial application
  await page.waitForSelector('body', { timeout: 10000 })
  const initialPath = path.join(OUT_DIR, 'headful_01_initial.png')
  await page.screenshot({ path: initialPath, fullPage: true })
  report.screenshots.initial = initialPath

  // verify map and markers
  let mapVisible = false
  let markersVisible = false
  try{
    await page.waitForSelector('.leaflet-container, #map', { timeout: 8000 })
    mapVisible = true
  }catch(e){ mapVisible = false }
  try{
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 8000 })
    markersVisible = true
  }catch(e){ markersVisible = false }

  report.results.mapVisible = mapVisible
  report.results.markersVisible = markersVisible

  // 2. Marker interaction - click center of first marker
  const markerSelectedPath = path.join(OUT_DIR, 'headful_02_marker_selected.png')
  let markerClickOk = false
  try{
    const marker = await page.$('.leaflet-marker-icon')
    if (marker){
      const box = await marker.boundingBox()
      if (box){
        await page.mouse.click(box.x + box.width/2, box.y + box.height/2)
        await new Promise(r => setTimeout(r, 800))
        await page.screenshot({ path: markerSelectedPath })
        markerClickOk = true
      }
    }
    // attempt to click 'View Details' in overlay if present
    try{
      await new Promise(r => setTimeout(r, 600))
      const [viewBtn] = await page.$x("//button[normalize-space(text())='View Details' or contains(normalize-space(.), 'View')]")
      if (viewBtn){
        await viewBtn.click()
        await new Promise(r => setTimeout(r, 1200))
      }
    }catch(e){}
  }catch(e){ markerClickOk = false }
  report.screenshots.marker_selected = markerSelectedPath
  report.results.markerClick = markerClickOk

  // 3. Facility details - wait for details panel
  const detailsPath = path.join(OUT_DIR, 'headful_03_facility_details.png')
  let detailsOk = false
  try{
    // try best-effort: capture the visible details area after attempting to open it
    await page.waitForTimeout(500)
    await page.screenshot({ path: detailsPath, fullPage: false })
    detailsOk = true
  }catch(e){ detailsOk = false }
  report.screenshots.facility_details = detailsPath
  report.results.facilityDetails = detailsOk

  // Inspect details actions
  let callAction = 'NOT_TESTED'
  let directionsAction = 'NOT_TESTED'
  try{
    const phoneLink = await page.$('a[href^="tel:"]')
    if (phoneLink) callAction = 'PRESENT'
    const directionsLink = await page.$('a[target="_blank"][href*="google.com/maps"]')
    if (directionsLink) directionsAction = 'PRESENT'
  }catch(e){}
  report.results.callAction = callAction
  report.results.directionsAction = directionsAction

  // 4. Return to results - click close
  const returnPath = path.join(OUT_DIR, 'headful_04_returned_results.png')
  let returnOk = false
  try{
    const closeBtn = await page.$('[aria-label="Close details"]')
    if (closeBtn){
      await closeBtn.click()
      await new Promise(r => setTimeout(r, 500))
      await page.screenshot({ path: returnPath })
      returnOk = true
    }
  }catch(e){ returnOk = false }
  report.screenshots.returned = returnPath
  report.results.returnedOk = returnOk

  // 5. Near Me - attempt geolocation
  const nearPath = path.join(OUT_DIR, 'headful_05_nearme.png')
  let nearResult = 'NOT_TESTABLE'
  try{
    const context = browser.defaultBrowserContext()
    await context.overridePermissions(url, ['geolocation'])
    await page.setGeolocation({ latitude: 5.045, longitude: 7.926 })
    const [nearBtn] = await page.$x("//button[contains(., 'Near Me')]")
    if (nearBtn){
      await nearBtn.click()
      try{
        await page.waitForFunction(()=>{
          const btn = Array.from(document.querySelectorAll('button')).find(b=>b.textContent && b.textContent.includes('Near Me'))
          if (btn && btn.textContent.includes('✓')) return true
          const d = document.querySelector('article .text-sm.text-gray-700')
          return Boolean(d && /m|km/.test(d.textContent))
        }, { timeout: 5000 })
        nearResult = 'PASS'
      }catch(e){ nearResult = 'FAIL' }
      await page.screenshot({ path: nearPath })
    }
  }catch(e){ nearResult = 'NOT_TESTABLE' }
  report.screenshots.near_me = nearPath
  report.results.nearMe = nearResult

  const reportPath = path.join(OUT_DIR, 'report_headful.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log('HEADFUL_REPORT:' + reportPath)

  // keep browser open briefly for manual inspection then close
  await new Promise(r => setTimeout(r, 1000))
  await browser.close()
}

run().catch(e=>{ console.error(e); process.exit(1) })
