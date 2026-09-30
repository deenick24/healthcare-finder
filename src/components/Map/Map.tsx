import React, { useEffect, useRef, useState } from 'react'
import type { Facility } from '../../types/facility'
import { loadGoogleMaps } from '../../lib/googleMaps'
import { getMarkerIcon } from '../../lib/markerIcons'
import MapPreview from './MapPreview'
import MapFallback from './MapFallback'
import { createRoot, Root } from 'react-dom/client'

interface Props { facilities: Facility[]; selectedId?: string | null; onSelect: (id:string | null)=>void; userLocation?: { lat:number; lng:number } | null; onRequestLocate?: ()=>void }

export default function Map({facilities,selectedId,onSelect,userLocation,onRequestLocate}:Props){
  const ref = useRef<HTMLDivElement|null>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const infoWindowRef = useRef<any>(null)
  const [userLocationMarker, setUserLocationMarker] = useState<any>(null)
  const [mapsError, setMapsError] = useState<string | null>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const facilitiesRef = useRef(facilities)
  const selectedRef = useRef<string | null>(selectedId ?? null)
  useEffect(()=>{ facilitiesRef.current = facilities }, [facilities])
  useEffect(()=>{ selectedRef.current = selectedId ?? null }, [selectedId])

  useEffect(() => {
    let mounted = true
    loadGoogleMaps().then(()=>{
      if (!mounted) return
      if (!ref.current) return
      const center = { lat: 5.0523, lng: 7.9078 } // Akwa Ibom approx
      mapRef.current = new (window as any).google.maps.Map(ref.current, {
        center,
        zoom: 9
      })
      infoWindowRef.current = new (window as any).google.maps.InfoWindow()

      setMapsLoaded(true)

      // create a reusable OverlayView to position a React preview card
      const overlay = new (window as any).google.maps.OverlayView()
      let overlayDiv: HTMLDivElement | null = null
      let overlayRoot: Root | null = null
      overlay.onAdd = function(){
        overlayDiv = document.createElement('div')
        overlayDiv.style.position = 'absolute'
        overlayDiv.style.transform = 'translate(-50%, -100%)'
        overlayDiv.style.pointerEvents = 'auto'
        overlay.getPanes().floatPane.appendChild(overlayDiv)
        overlayRoot = createRoot(overlayDiv)
      }
      overlay.draw = function(){
        if (!overlayDiv) return
        const sel = selectedRef.current
        if (!sel) { overlayDiv.style.display = 'none'; return }
        const f = facilitiesRef.current.find((x:any)=>x.id === sel)
        if (!f || f.latitude == null || f.longitude == null){ overlayDiv.style.display = 'none'; return }
        const projection = overlay.getProjection()
        if (!projection) return
        const pos = new (window as any).google.maps.LatLng(Number(f.latitude), Number(f.longitude))
        const point = projection.fromLatLngToDivPixel(pos)
        overlayDiv.style.left = `${point.x}px`
        overlayDiv.style.top = `${point.y - 12}px`
        overlayDiv.style.display = 'block'
        if (overlayRoot) overlayRoot.render(<MapPreview facility={f as any} onViewDetails={()=> onSelect(f.id)} />)
      }
      overlay.onRemove = function(){
        if (overlayDiv && overlayDiv.parentNode) overlayDiv.parentNode.removeChild(overlayDiv)
        if (overlayRoot) { overlayRoot.unmount(); overlayRoot = null }
        overlayDiv = null
      }
      overlay.setMap(mapRef.current)
      ;(mapRef as any).overlay = overlay
    }).catch(err=>{
      console.error('Google Maps load error', err)
      setMapsError(String(err?.message || err))
    })
    return ()=>{ mounted = false }
  },[])

  // Update markers when facilities change
  useEffect(()=>{
    if (!mapRef.current) return
    // remove markers that are no longer present
    const newIds = new Set(facilities.map(f=>f.id))
    Object.keys(markersRef.current).forEach(id => {
      if (!newIds.has(id)){
        try{ markersRef.current[id].setMap(null) }catch(e){}
        delete markersRef.current[id]
      }
    })

    const bounds = new (window as any).google.maps.LatLngBounds()
    let haveMarker = false

    facilities.forEach(f=>{
      if (f.latitude == null || f.longitude == null) return
      haveMarker = true
      if (!markersRef.current[f.id]){
        const marker = new (window as any).google.maps.Marker({
          position: { lat: Number(f.latitude), lng: Number(f.longitude) },
          map: mapRef.current,
          title: f.name,
          icon: { url: getMarkerIcon(Boolean(f.verified), false), scaledSize: new (window as any).google.maps.Size(32,32) }
        })
        marker.addListener('click', ()=>{
          onSelect(f.id)
        })
        markersRef.current[f.id] = marker
      }
      bounds.extend(new (window as any).google.maps.LatLng(Number(f.latitude), Number(f.longitude)))
    })

    // adjust viewport
    try{
      if (haveMarker){
        if (Object.keys(markersRef.current).length === 1){
          const only = Object.values(markersRef.current)[0]
          mapRef.current.setCenter(only.getPosition())
          mapRef.current.setZoom(14)
        } else {
          mapRef.current.fitBounds(bounds, 64)
        }
      }
    }catch(e){ /* ignore fit errors */ }
  }, [facilities])

  // open info window / focus marker when selectedId changes
  useEffect(()=>{
    if (!mapRef.current) return
    if (!selectedId){
      // close infowindow and hide overlay
      try{ infoWindowRef.current.close() }catch(e){}
      try{ const ov = (mapRef as any).overlay; if (ov && ov.draw) ov.draw() }catch(e){}
      return
    }
    const m = markersRef.current[selectedId]
    if (m){
      mapRef.current.panTo(m.getPosition())
      mapRef.current.setZoom(14)
      // update marker icons (selected state) and redraw overlay
      try{ Object.keys(markersRef.current).forEach(id=>{
        const mk = markersRef.current[id]
        const isSel = id === selectedId
        mk.setIcon({ url: getMarkerIcon(Boolean(facilities.find(x=>x.id===id)?.verified), isSel), scaledSize: new (window as any).google.maps.Size(isSel ? 40 : 32, isSel ? 40 : 32) })
      }) }catch(e){}
      try{ const ov = (mapRef as any).overlay; if (ov && ov.draw) ov.draw() }catch(e){}
    }
  }, [selectedId])

  // simple locate-me handler to prepare for geolocation features
  async function locateMe(){
    if (onRequestLocate) return onRequestLocate()
    if (!mapRef.current || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos)=>{
      const lat = pos.coords.latitude, lng = pos.coords.longitude
      mapRef.current.panTo({ lat, lng })
      mapRef.current.setZoom(13)
      if (userLocationMarker){ try{ userLocationMarker.setMap(null) }catch(e){} }
      const marker = new (window as any).google.maps.Marker({ position: { lat, lng }, map: mapRef.current, title: 'You are here' })
      setUserLocationMarker(marker)
    }, (err)=>{
      console.warn('Geolocation error', err)
    })
  }

  // when userLocation prop changes, show/update marker
  useEffect(()=>{
    if (!mapRef.current) return
    if (!userLocation) return
    try{
      if (userLocationMarker){ userLocationMarker.setMap(null) }
    }catch(e){}
    const marker = new (window as any).google.maps.Marker({ position: { lat: userLocation.lat, lng: userLocation.lng }, map: mapRef.current, title: 'You are here' })
    setUserLocationMarker(marker)
    mapRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng })
    mapRef.current.setZoom(13)
  }, [userLocation])

  if (mapsError) {
    // Render Leaflet fallback when Google Maps failed to load
    return (
      <div className="w-full h-full rounded relative">
        <div className="w-full h-full rounded border bg-gray-50" style={{height:'100%'}}>
          <MapFallback facilities={facilities} selectedId={selectedId} onSelect={onSelect} userLocation={userLocation} onRequestLocate={onRequestLocate} />
        </div>
        <div className="absolute top-2 right-2">
          <button onClick={locateMe} className="bg-white px-2 py-1 rounded shadow text-sm">Locate me</button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded relative">
      <div ref={ref} className="w-full h-full rounded border bg-gray-50" />
      <div className="absolute top-2 right-2">
        <button onClick={locateMe} className="bg-white px-2 py-1 rounded shadow text-sm">Locate me</button>
      </div>
    </div>
  )
}

function escapeHtml(s: string | undefined | null){
  if (!s) return ''
  return String(s).replace(/[&<>\"]/g, (c)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as any)[c])
}
