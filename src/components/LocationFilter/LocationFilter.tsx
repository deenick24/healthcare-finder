import React from 'react'

const LGAS = ['All','Uyo','Ikot Ekpene','Eket','Oron','Abak','Etinan','Itu','Ibeno']

interface Props { value: string; onChange: (v:string)=>void }

export default function LocationFilter({value,onChange}:Props){
  return (
    <div className="mb-3">
      <label className="block text-sm text-gray-700">Location (LGA)</label>
      <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full p-2 border rounded">
        {LGAS.map(l=> <option key={l} value={l}>{l}</option>)}
      </select>
    </div>
  )
}
