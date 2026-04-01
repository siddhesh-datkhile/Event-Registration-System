import api from './axiosInstance'
import { ENDPOINTS } from './endpoints'

import type {  Venue  } from '../model'

export async function getAllVenues(): Promise<Venue[]> {
  const res = await api.get<Venue[]>(ENDPOINTS.VENUES.BASE)
  return res.data
}

export async function addVenue(payload: { name: string; address: string; city: string }): Promise<Venue> {
  const res = await api.post<Venue>(ENDPOINTS.VENUES.BASE, payload)
  return res.data
}
