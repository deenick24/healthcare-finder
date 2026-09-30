import React from 'react'

interface Props {
  value: string
  onChange: (v:string)=>void
  onClear: ()=>void
  serviceOptions: string[]
  selectedService: string
  onServiceChange: (v:string)=>void
}

export default function SearchBar({value,onChange,onClear,serviceOptions,selectedService,onServiceChange}:Props){
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Search facilities or services</label>
      <div className="flex">
        <input
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder="e.g. hospital, pharmacy, eye care"
          className="flex-1 p-3 border rounded-l-md text-sm"
          aria-label="Search facilities or services"
        />
        <button onClick={onClear} className="px-4 bg-gray-100 border rounded-r-md text-sm">Clear</button>
      </div>
      <label className="block text-sm font-medium text-gray-700 mt-3 mb-1" htmlFor="service-filter">Filter by service</label>
      <select
        id="service-filter"
        value={selectedService}
        onChange={(e)=>onServiceChange(e.target.value)}
        className="w-full p-3 border rounded-md text-sm bg-white"
      >
        <option value="">All services</option>
        {serviceOptions.map(service => <option key={service} value={service}>{service}</option>)}
      </select>
    </div>
  )
}
