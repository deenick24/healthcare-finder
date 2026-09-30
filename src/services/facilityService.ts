import { supabase } from '../lib/supabase'
import type { Facility } from '../types/facility'

export async function fetchFacilities(lga?: string): Promise<{ data: Facility[] | null; error: any }>{
  try{
    let query = supabase.from('facilities').select('*').eq('state','Akwa Ibom')
    if (lga && lga !== 'All') query = query.eq('lga', lga)
    const res = await query
    if (res.error) return { data: null, error: res.error }
    return { data: res.data as Facility[], error: null }
  }catch(err){
    return { data: null, error: err }
  }
}
