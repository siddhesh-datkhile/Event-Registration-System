import api from './axiosInstance'
import type {  RegistrationResponse  } from '../model'

export async function getMyRegistrations(): Promise<RegistrationResponse[]> {
  const res = await api.get<RegistrationResponse[]>('/api/registrations/my-registrations')
  return res.data
}

export async function createRegistration(eventId: number): Promise<RegistrationResponse> {
  const res = await api.post<RegistrationResponse>('/api/registrations/register', { eventId })
  return res.data
}

export async function cancelRegistration(registrationId: number): Promise<RegistrationResponse> {
  const res = await api.post<RegistrationResponse>(`/api/registrations/${registrationId}/cancel`)
  return res.data
}

export async function getEventRegistrations(eventId: number | string): Promise<RegistrationResponse[]> {
  const res = await api.get<RegistrationResponse[]>(`/api/registrations/event/${eventId}`)
  return res.data
}

export async function getAllRegistrations(): Promise<RegistrationResponse[]> {
  const res = await api.get<RegistrationResponse[]>('/api/registrations/admin/all')
  return res.data
}
