export function getMarkerIcon(verified: boolean, selected = false){
  // simple SVG marker with color based on verified status
  const fill = verified ? '#10B981' : '#3B82F6' // green for verified, blue for unverified
  const stroke = selected ? '#000000' : '#ffffff'
  const size = selected ? 40 : 32
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' fill='${fill}' stroke='${stroke}' stroke-width='1.5' /></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
