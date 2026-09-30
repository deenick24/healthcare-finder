export function loadGoogleMaps(apiKey?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) return resolve()
    const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) {
      console.warn('Google Maps API key not provided')
      return reject(new Error('Google Maps API key not provided'))
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
}
