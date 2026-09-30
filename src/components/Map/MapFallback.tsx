import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Facility } from '../../types/facility'
import { getMarkerIcon } from '../../lib/markerIcons'

interface Props { facilities: Facility[]; selectedId?: string | null; onSelect: (id:string | null)=>void; userLocation?: { lat:number; lng:number } | null; onRequestLocate?: ()=>void }

function Recenter({ pos }: { pos?: [number,number] }){
  const map = useMap()
  useEffect(()=>{
    if (pos) map.setView(pos, 13)
  },[pos])
  return null
}

function FitFacilities({ facilities }: { facilities: Facility[] }){
  const map = useMap()

  useEffect(()=>{
    const located = facilities.filter(f => f.latitude != null && f.longitude != null)
    if (located.length === 0) return

    if (located.length === 1) {
      map.setView([Number(located[0].latitude), Number(located[0].longitude)], 13)
      return
    }

    const bounds = L.latLngBounds(located.map(f => [Number(f.latitude), Number(f.longitude)] as [number, number]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 })
  }, [facilities, map])

  return null
}

export default function MapFallback({facilities,selectedId,onSelect,userLocation}:Props){
  const center:[number,number] = useMemo(()=>{
    if (userLocation) return [userLocation.lat, userLocation.lng]
    // fallback center Akwa Ibom approx
    return [5.0523, 7.9078]
  },[userLocation])

  return (
    <MapContainer center={center} zoom={9} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {facilities.map(f=>{
        if (f.latitude == null || f.longitude == null) return null
        const icon = L.icon({ iconUrl: getMarkerIcon(Boolean(f.verified), selectedId === f.id), iconSize: selectedId === f.id ? [40,40] : [32,32], iconAnchor: [16,32] })
        return (
          <Marker key={f.id} position={[Number(f.latitude), Number(f.longitude)]} icon={icon} eventHandlers={{ click:()=> onSelect(f.id) }} />
        )
      })}
      {userLocation ? (
        (()=>{
          const userIcon = L.divIcon({ className: 'user-location-marker', html: '<div style="width:12px;height:12px;background:#000;border-radius:50%;border:2px solid white;"></div>' })
          return <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon as any} />
        })()
      ) : null}
      <FitFacilities facilities={facilities} />
      <Recenter pos={selectedId ? (facilities.find(f=>f.id===selectedId && f.latitude != null && f.longitude != null) ? [Number(facilities.find(f=>f.id===selectedId)!.latitude), Number(facilities.find(f=>f.id===selectedId)!.longitude)] as [number,number] : undefined) : undefined} />
    </MapContainer>
  )
}
