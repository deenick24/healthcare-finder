export function toRadians(deg: number){
  return deg * Math.PI / 180
}

// returns distance in meters between two lat/lng points using Haversine
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number{
  const R = 6371000 // Earth radius in meters
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function formatDistance(meters: number): string{
  if (!isFinite(meters) || isNaN(meters)) return ''
  if (meters < 1000) {
    const m = Math.round(meters)
    return `${m} m away`
  }
  const km = (meters/1000)
  const rounded = Math.round(km * 10) / 10 // one decimal
  return `${rounded} km away`
}
