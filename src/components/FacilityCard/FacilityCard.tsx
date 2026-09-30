import React from 'react'
import type { Facility } from '../../types/facility'

interface Props { facility: Facility; onSelect: ()=>void; selected?: boolean; distanceText?: string | null }

export default function FacilityCard({facility,onSelect,selected=false,distanceText}:Props){
  return (
    <article className={`p-3 bg-white border rounded ${selected ? 'border-blue-500 bg-blue-50' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h3 className="font-medium">{facility.name}</h3>
          <div className="text-sm text-gray-600">{facility.lga} — {facility.address}</div>
          <div className="text-sm mt-2">Services: {facility.services?.slice(0,3).join(', ')}</div>
        </div>
        {distanceText ? <div className="text-sm text-gray-700 whitespace-nowrap">{distanceText}</div> : null}
      </div>
      <div className="flex items-center mt-3 gap-2">
        {facility.phone ? (
          <a href={`tel:${facility.phone}`} className="text-sm text-blue-600">{facility.phone}</a>
        ) : (
          <span className="text-sm text-gray-500">No phone</span>
        )}
        <button onClick={onSelect} className="ml-auto px-3 py-1 bg-blue-600 text-white rounded text-sm">View</button>
      </div>
    </article>
  )
}
