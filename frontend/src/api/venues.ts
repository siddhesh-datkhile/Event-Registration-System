import api from './axiosInstance'
import type {  Venue  } from '../model'

export async function getAllVenues(): Promise<Venue[]> {
  const res = await api.get<Venue[]>('/api/venues')
  return res.data
}

export async function addVenue(payload: { name: string; address: string; city: string }): Promise<Venue> {
  const res = await api.post<Venue>('/api/venues', payload)
  return res.data
}
