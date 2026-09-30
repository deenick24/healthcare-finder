import React from 'react'
import type { Facility } from '../../types/facility'

interface Props { facility: Facility & { distanceText?: string | null }; onViewDetails: ()=>void }

export default function MapPreview({facility,onViewDetails}:Props){
  if (!facility) return null
  return (
    <div className="bg-white border rounded shadow p-2 text-sm" style={{minWidth:220}}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{facility.name}</div>
          <div className="text-gray-600 text-xs">{facility.lga} — {facility.address}</div>
        </div>
        <div className="text-xs text-gray-700">{facility.verified ? <span className="text-green-600">Verified</span> : <span className="text-gray-600">Unverified</span>}</div>
      </div>
      {facility.distanceText ? <div className="mt-2 text-sm">{facility.distanceText}</div> : null}
      <div className="mt-2 flex justify-end">
        <button onClick={onViewDetails} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">View Details</button>
      </div>
    </div>
  )
}
