import React, { useEffect, useState, useMemo } from 'react'
import Header from '../components/Header/Header'
import SearchBar from '../components/SearchBar/SearchBar'
import LocationFilter from '../components/LocationFilter/LocationFilter'
import Map from '../components/Map/Map'
import FacilityDetails from '../components/FacilityDetails/FacilityDetails'
import useFacilities from '../hooks/useFacilities'
import { calculateDistanceMeters, formatDistance } from '../lib/distance'

function normalizeServices(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(item => normalizeServices(item))
  if (value && typeof value === 'object') {
    const services = (value as { services?: unknown }).services
    return services ? normalizeServices(services) : Object.values(value).flatMap(item => normalizeServices(item))
  }
  if (typeof value !== 'string') return []

  const trimmed = value.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (parsed !== value) return normalizeServices(parsed)
  } catch {
    // Keep plain text values as a single service.
  }

  return [trimmed]
}

export default function Home(){
  const [search, setSearch] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [lga, setLga] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat:number; lng:number} | null>(null)
  const [nearMeStatus, setNearMeStatus] = useState<'idle'|'loading'|'active'|'error'>('idle')
  const [nearMeError, setNearMeError] = useState<string | null>(null)

  const { facilities, loading, error } = useFacilities(lga)

  const serviceOptions = useMemo(() => {
    const services = new globalThis.Map<string, string>()
    facilities.forEach(facility => {
      normalizeServices(facility.services).forEach(service => {
        const key = service.trim().toLowerCase()
        if (key && !services.has(key)) services.set(key, service.trim())
      })
    })
    return [...services.values()].sort((a, b) => a.localeCompare(b))
  }, [facilities])

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase()
    const selectedServiceKey = selectedService.trim().toLowerCase()
    return facilities.filter(facility => {
      const services = normalizeServices(facility.services)
      const matchesSearch = !query || [
        facility.name,
        facility.address,
        facility.lga,
        facility.state,
        ...services,
      ].some(value => value.toLowerCase().includes(query))
      const matchesService = !selectedServiceKey || services.some(service => service.toLowerCase() === selectedServiceKey)
      return matchesSearch && matchesService
    })
  }, [facilities, search, selectedService])

  // request browser geolocation and set userLocation
  function requestLocation(){
    if (!navigator.geolocation) {
      setNearMeStatus('error')
      setNearMeError('Geolocation is not supported by your browser')
      return
    }
    setNearMeStatus('loading')
    setNearMeError(null)
    navigator.geolocation.getCurrentPosition((pos)=>{
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setNearMeStatus('active')
    }, (err)=>{
      let msg = 'Unable to determine location'
      if (err.code === 1) msg = 'Location permission denied'
      else if (err.code === 2) msg = 'Position unavailable'
      else if (err.code === 3) msg = 'Location request timed out'
      setNearMeStatus('error')
      setNearMeError(msg)
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 })
  }

  // derive distances (meters) and formatted text when userLocation is available
  const facilitiesWithDistance = useMemo(()=>{
    if (!filteredFacilities) return []
    return filteredFacilities.map(f => {
      const copy: any = { ...f }
      if (userLocation && f.latitude != null && f.longitude != null){
        const meters = calculateDistanceMeters(userLocation.lat, userLocation.lng, Number(f.latitude), Number(f.longitude))
        copy.distanceMeters = meters
        copy.distanceText = formatDistance(meters)
      } else {
        copy.distanceMeters = undefined
        copy.distanceText = undefined
      }
      return copy
    })
  }, [filteredFacilities, userLocation])

  // sorted according to near-me active state (after filtering/search)
  const sortedFacilities = useMemo(()=>{
    const list = [...facilitiesWithDistance]
    if (nearMeStatus === 'active' && userLocation){
      list.sort((a:any,b:any)=>{
        const da = typeof a.distanceMeters === 'number' ? a.distanceMeters : Number.POSITIVE_INFINITY
        const db = typeof b.distanceMeters === 'number' ? b.distanceMeters : Number.POSITIVE_INFINITY
        return da - db
      })
    }
    return list
  }, [facilitiesWithDistance, nearMeStatus, userLocation])

  const selectedFacility = selected
    ? sortedFacilities.find((f:any) => f.id === selected)
    : null

  useEffect(() => {
    if (selected && !selectedFacility) {
      setSelected(null)
      setShowDetails(false)
    }
  }, [selected, selectedFacility])

  if (showDetails && selectedFacility) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto p-4">
          <FacilityDetails
            facility={selectedFacility as any}
            onClose={() => setShowDetails(false)}
            userLocation={userLocation}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h1 className="text-xl font-semibold">Find healthcare near you</h1>
              <p className="text-sm text-gray-600 mt-1">Quickly find hospitals, clinics, pharmacies and services nearby.</p>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="flex gap-2 items-center">
                  <LocationFilter value={lga} onChange={setLga} />
                  <button onClick={()=>requestLocation()} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                    {nearMeStatus === 'loading' ? 'Finding you...' : nearMeStatus === 'active' ? '📍 Near Me ✓' : '📍 Use my location'}
                  </button>
                </div>

                    <SearchBar
                      value={search}
                      onChange={setSearch}
                      onClear={() => setSearch('')}
                      serviceOptions={serviceOptions}
                      selectedService={selectedService}
                      onServiceChange={setSelectedService}
                    />
              </div>
            </div>

            {nearMeStatus === 'error' && nearMeError ? <div className="text-sm text-red-600 mb-2">{nearMeError}</div> : null}

          </div>
          <div className="md:w-2/3 h-80 md:h-[80vh]">
            <Map facilities={sortedFacilities as any} selectedId={selected} onSelect={setSelected} userLocation={userLocation} onRequestLocate={requestLocation} />
            {sortedFacilities.length === 0 && !loading ? (
              <div className="mt-2 p-4 bg-white border rounded text-center text-gray-600">
                No facilities found for this service.
              </div>
            ) : null}
          </div>
        </div>
      </main>
      {/* Selected facility overlay */}
      {selected ? (()=>{
        const facility = selectedFacility
        if (!facility) return null
        return (
          <div>
            {/* Desktop: left floating panel; Mobile: bottom floating card */}
            <div className="fixed z-50 bg-white border rounded shadow overflow-auto hidden md:block p-3"
                 style={{
                   top: 96,
                   left: 20,
                   maxWidth: 320,
                   maxHeight: '70vh'
                 }}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h3 className="font-medium">{facility.name}</h3>
                  <div className="text-sm text-gray-600">{facility.lga} — {facility.address}</div>
                  {facility.distanceText ? <div className="text-sm text-gray-700 mt-2">{facility.distanceText}</div> : null}
                  <div className="text-sm mt-2">Services: {facility.services?.slice(0,3).join(', ')}</div>
                </div>
                <button onClick={()=>{ setSelected(null); setShowDetails(false) }} aria-label="Close" className="text-gray-600">✕</button>
              </div>
              <div className="flex gap-2 mt-3">
                {facility.phone ? <a href={`tel:${facility.phone}`} className="px-3 py-1 bg-blue-600 text-white rounded">Call</a> : <span className="px-3 py-1 text-sm text-gray-500">No phone</span>}
                {facility.latitude != null && facility.longitude != null ? (
                  <a className="px-3 py-1 bg-green-600 text-white rounded" href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">Directions</a>
                ) : null}
                <button onClick={()=>setShowDetails(true)} className="ml-auto px-3 py-1 bg-gray-100 rounded">View Details</button>
              </div>
            </div>

            {/* Mobile bottom sheet */}
            <div className="fixed z-50 left-1/2 transform -translate-x-1/2 w-[94%] max-w-md p-3 bg-white border rounded shadow md:hidden" style={{bottom:20}}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h3 className="font-medium">{facility.name}</h3>
                  <div className="text-sm text-gray-600">{facility.lga}</div>
                </div>
                <button onClick={()=>{ setSelected(null); setShowDetails(false) }} aria-label="Close" className="text-gray-600">✕</button>
              </div>
              <div className="mt-2 text-sm text-gray-700">{facility.distanceText}</div>
              <div className="flex gap-2 mt-3">
                {facility.phone ? <a href={`tel:${facility.phone}`} className="px-3 py-1 bg-blue-600 text-white rounded">Call</a> : <span className="px-3 py-1 text-sm text-gray-500">No phone</span>}
                {facility.latitude != null && facility.longitude != null ? (
                  <a className="px-3 py-1 bg-green-600 text-white rounded" href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">Directions</a>
                ) : null}
                <button onClick={()=>setShowDetails(true)} className="ml-auto px-3 py-1 bg-gray-100 rounded">View Details</button>
              </div>
            </div>
          </div>
        )
      })() : null}
    </div>
  )
}
