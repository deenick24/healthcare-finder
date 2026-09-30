import React from 'react'
import type { Facility } from '../../types/facility'

interface ExtendedFacility extends Facility { distanceMeters?: number; distanceText?: string }

interface Props { facility?: ExtendedFacility | null; onClose: ()=>void; userLocation?: { lat:number; lng:number } | null }

export default function FacilityDetails({facility,onClose,userLocation}:Props){
  if (!facility) return (
    <div className="p-4 bg-white border rounded">No facility selected</div>
  )

  const hasCoords = facility.latitude != null && facility.longitude != null
  const mapsBase = hasCoords ? `https://www.google.com/maps` : null
  // prefer directions URL; include origin if userLocation available
  const directionsUrl = hasCoords ? (
    userLocation ?
      `${mapsBase}/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facility.latitude},${facility.longitude}` :
      `${mapsBase}/dir/?api=1&destination=${facility.latitude},${facility.longitude}`
  ) : null

  return (
    <div className="p-4 bg-white border rounded" role="region" aria-label="Facility details">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">{facility.name}</h2>
          {facility.distanceText ? <div className="text-sm text-gray-700">{facility.distanceText}</div> : null}
          {facility.address ? <div className="text-sm text-gray-600">{facility.address}</div> : null}
          <div className="text-sm text-gray-600">{facility.lga} — {facility.state}</div>
        </div>
        <button onClick={onClose} aria-label="Back to map" className="text-sm text-gray-500">Back to map</button>
      </div>

      {facility.phone ? (
        <div className="mt-3 text-sm">Phone: <a href={`tel:${facility.phone}`} className="text-blue-600">{facility.phone}</a></div>
      ) : (
        <div className="mt-3 text-sm text-gray-500">Phone: Not provided</div>
      )}

      <div className="text-sm mt-2">Services: {facility.services?.length ? facility.services.join(', ') : <span className="text-gray-500">Services not available</span>}</div>

      <div className="mt-2 text-sm">Verified: {facility.verified ? <span className="text-green-600">Verified</span> : <span className="text-gray-600">Not verified</span>}</div>

      <div className="flex gap-2 mt-4">
        {facility.phone && (
          <a href={`tel:${facility.phone}`} className="px-3 py-1 bg-blue-600 text-white rounded">Call Facility</a>
        )}

        {directionsUrl && (
          <a className="px-3 py-1 bg-green-600 text-white rounded" href={directionsUrl} target="_blank" rel="noreferrer">Get Directions</a>
        )}

        {!directionsUrl && (
          <span className="text-sm text-gray-500">No coordinates available</span>
        )}
      </div>
    </div>
  )
}
