import api from './axiosInstance'
import { ENDPOINTS } from './endpoints'

import type {  Event  } from '../model'

export async function getAllEvents(): Promise<Event[]> {
  const res = await api.get<Event[]>(ENDPOINTS.EVENTS.BASE)
  return res.data
}

export async function getEventById(id: number | string): Promise<Event> {
  const res = await api.get<Event>(ENDPOINTS.EVENTS.BY_ID(id))
  return res.data
}

export async function createEvent(data: Partial<Event>): Promise<Event> {
  const res = await api.post<Event>(ENDPOINTS.EVENTS.BASE, data)
  return res.data
}

export async function updateEvent(id: number | string, data: Partial<Event>): Promise<Event> {
  const res = await api.put<Event>(ENDPOINTS.EVENTS.BY_ID(id), data)
  return res.data
}

export async function deleteEvent(id: number | string): Promise<void> {
  await api.delete(ENDPOINTS.EVENTS.BY_ID(id))
}
