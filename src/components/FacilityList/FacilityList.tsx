import React from 'react'
import type { Facility } from '../../types/facility'
import FacilityCard from '../FacilityCard/FacilityCard'
import EmptyState from '../EmptyState/EmptyState'

interface Props { facilities: Facility[]; loading: boolean; error: any; onSelect: (id:string)=>void; selectedId?: string | null }

export default function FacilityList({facilities,loading,error,onSelect,selectedId}:Props){
  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">Error loading facilities</div>
  if (!facilities || facilities.length === 0) return <EmptyState />

  return (
    <div>
      <div className="mb-2 text-sm text-gray-600">{facilities.length} results</div>
      <div className="space-y-2">
        {facilities.map(f=> (
          <FacilityCard key={f.id} facility={f} onSelect={()=>onSelect(f.id)} selected={selectedId === f.id} distanceText={(f as any).distanceText} />
        ))}
      </div>
    </div>
  )
}
