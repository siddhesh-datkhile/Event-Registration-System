import api from './axiosInstance'

export interface Venue {
  id: number
  name: string
  address: string
  city: string
  createdAt?: string
  updatedAt?: string
}

export async function getAllVenues(): Promise<Venue[]> {
  const res = await api.get<Venue[]>('/api/venues')
  return res.data
}
