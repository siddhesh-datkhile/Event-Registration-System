import api from './axiosInstance'
import type {  EventStatus, Event  } from '../model'

export async function getAllEvents(): Promise<Event[]> {
  const res = await api.get<Event[]>('/api/events')
  return res.data
}

export async function getEventById(id: number | string): Promise<Event> {
  const res = await api.get<Event>(`/api/events/${id}`)
  return res.data
}

export async function createEvent(data: Partial<Event>): Promise<Event> {
  const res = await api.post<Event>('/api/events', data)
  return res.data
}

export async function updateEvent(id: number | string, data: Partial<Event>): Promise<Event> {
  const res = await api.put<Event>(`/api/events/${id}`, data)
  return res.data
}

export async function deleteEvent(id: number | string): Promise<void> {
  await api.delete(`/api/events/${id}`)
}
