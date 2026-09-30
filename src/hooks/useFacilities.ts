import { useEffect, useState } from 'react'
import type { Facility } from '../types/facility'
import { fetchFacilities } from '../services/facilityService'

export default function useFacilities(lgaFilter: string) {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fetchFacilities(lgaFilter)
      .then((res) => {
        if (!mounted) return
        if (res.error) setError(res.error)
        else {
          setFacilities(res.data || [])
        }
      })
      .catch((e) => setError(e))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [lgaFilter])

  return { facilities, loading, error }
}
