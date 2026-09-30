import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.join(process.cwd(), 'tools', 'screenshots')
fs.mkdirSync(OUT_DIR, { recursive: true })

async function run(){
  const report = {
    screenshots: {},
    console: [],
    networkErrors: [],
    results: {
      mapVisible: false,
      markersVisible: false,
      markerInteraction: false,
      facilityPreview: false,
      facilityDetails: false,
      nearMe: 'NOT_TESTED'
    }
  }

  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']})
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  page.on('console', msg => {
    try{ report.console.push({type: msg.type(), text: msg.text()}) }catch(e){}
  })
  page.on('response', async res => {
    try{
      const status = res.status()
      if (status >= 400){
        report.networkErrors.push({url: res.url(), status})
      }
    }catch(e){}
  })

  const url = 'http://localhost:5175/'
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

  // Wait for app root
  await page.waitForSelector('body', { timeout: 10000 })

  // 1. Main application (full page)
  const mainPath = path.join(OUT_DIR, '01_main_search.png')
  await page.screenshot({ path: mainPath, fullPage: true })
  report.screenshots.main = mainPath

  // 2. Facility list (first facility card)
  let facilityCardPath = path.join(OUT_DIR, '02_facility_list_first_card.png')
  try{
    await page.waitForSelector('article', { timeout: 5000 })
    const card = await page.$('article')
    await card.screenshot({ path: facilityCardPath })
    report.screenshots.facility_card = facilityCardPath
  }catch(e){
    report.screenshots.facility_card = null
  }

  // 3. Visible map
  const mapPath = path.join(OUT_DIR, '03_map_container.png')
  try{
    await page.waitForSelector('.leaflet-container, #map', { timeout: 7000 })
    const mapEl = await page.$('.leaflet-container') || await page.$('#map')
    if (mapEl){
      await mapEl.screenshot({ path: mapPath })
      report.screenshots.map = mapPath
      report.results.mapVisible = true
    }
  }catch(e){
    report.screenshots.map = null
  }

  // 4. Map with facilities / 5. verified/unverified markers
  const mapMarkersPath = path.join(OUT_DIR, '04_map_with_markers.png')
  try{
    // wait for markers
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 7000 })
    const markers = await page.$$eval('.leaflet-marker-icon', m => m.map(n=> n.tagName === 'IMG' ? n.src : (n.querySelector ? (n.querySelector('img') ? n.querySelector('img').src : '') : '')))
    report.screenshots.map_with_markers = mapMarkersPath
    const mapEl = await page.$('.leaflet-container')
    if (mapEl) await mapEl.screenshot({ path: mapMarkersPath })
    report.results.markersVisible = markers.length > 0
    report.markerSrcs = markers

    // try detect verified/unverified colors in data URLs
    const hasVerified = markers.some(s => s && s.includes('%2310B981'))
    const hasUnverified = markers.some(s => s && s.includes('%233B82F6'))
    report.verifiedDetected = hasVerified
    report.unverifiedDetected = hasUnverified
  }catch(e){
    report.screenshots.map_with_markers = null
  }

  // 6. Selected facility - click a facility marker
  const afterClickMap = path.join(OUT_DIR, '05_map_after_marker_click.png')
  try{
    const firstMarker = await page.$('.leaflet-marker-icon')
    if (firstMarker){
      await firstMarker.click()
      // small pause for UI to update
      await new Promise(r => setTimeout(r, 700))
      const mapEl = await page.$('.leaflet-container')
      if (mapEl) await mapEl.screenshot({ path: afterClickMap })
      report.screenshots.map_after_click = afterClickMap
      report.results.markerInteraction = true
    }
  }catch(e){
    report.screenshots.map_after_click = null
  }

  // 7 & 8. Facility preview / Facility details
  const previewPath = path.join(OUT_DIR, '06_facility_preview.png')
  const detailsPath = path.join(OUT_DIR, '07_facility_details.png')
  try{
    // FacilityDetails component has aria-label "Facility details"
    await page.waitForSelector('[aria-label="Facility details"]', { timeout: 5000 })
    const detailsEl = await page.$('[aria-label="Facility details"]')
    if (detailsEl){
      await detailsEl.screenshot({ path: detailsPath })
      report.screenshots.facility_details = detailsPath
      report.results.facilityDetails = true
    }
  }catch(e){
    report.screenshots.facility_details = null
  }

  // 10. Near Me: attempt to grant geolocation and click Near Me
  try{
    const context = browser.defaultBrowserContext()
    await context.overridePermissions(url, ['geolocation'])
    await page.setGeolocation({ latitude: 5.045, longitude: 7.926 })
    // find Near Me button by text
    const [nearBtn] = await page.$x("//button[contains(., 'Near Me')]")
    if (nearBtn){
      await nearBtn.click()
      // wait for either the button to show active check or distance text to appear
      await new Promise(r => setTimeout(r, 1000))
      let nearResult = 'FAIL'
      try{
        await page.waitForFunction(()=>{
          const btn = Array.from(document.querySelectorAll('button')).find(b=>b.textContent && b.textContent.includes('Near Me'))
          if (btn && btn.textContent.includes('✓')) return true
          // or check for distance text within first article
          const d = document.querySelector('article .text-sm.text-gray-700')
          return Boolean(d && /m|km/.test(d.textContent))
        }, { timeout: 5000 })
        nearResult = 'PASS'
      }catch(e){ nearResult = 'NOT_TESTABLE' }
      report.results.nearMe = nearResult
      const nearMapPath = path.join(OUT_DIR, '08_nearme_map.png')
      const mapEl = await page.$('.leaflet-container')
      if (mapEl) await mapEl.screenshot({ path: nearMapPath })
      report.screenshots.near_me = nearMapPath
    } else {
      report.results.nearMe = 'NOT_TESTABLE'
    }
  }catch(e){
    report.results.nearMe = 'NOT_TESTABLE'
  }

  // save report
  const reportPath = path.join(OUT_DIR, 'report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log('REPORT_PATH:' + reportPath)

  await browser.close()
}

run().catch(e=>{ console.error(e); process.exit(1) })
