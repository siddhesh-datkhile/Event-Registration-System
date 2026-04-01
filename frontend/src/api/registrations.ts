import api from './axiosInstance'
import { ENDPOINTS } from './endpoints'

import type {  RegistrationResponse  } from '../model'

export async function getMyRegistrations(): Promise<RegistrationResponse[]> {
  const res = await api.get<RegistrationResponse[]>(ENDPOINTS.REGISTRATIONS.MY_REGISTRATIONS)
  return res.data
}

export async function createRegistration(eventId: number): Promise<RegistrationResponse> {
  const res = await api.post<RegistrationResponse>(ENDPOINTS.REGISTRATIONS.REGISTER, { eventId })
  return res.data
}

export async function cancelRegistration(registrationId: number): Promise<RegistrationResponse> {
  const res = await api.post<RegistrationResponse>(ENDPOINTS.REGISTRATIONS.CANCEL(registrationId))
  return res.data
}

export async function getEventRegistrations(eventId: number | string): Promise<RegistrationResponse[]> {
  const res = await api.get<RegistrationResponse[]>(ENDPOINTS.REGISTRATIONS.BY_EVENT(eventId))
  return res.data
}

export async function getAllRegistrations(): Promise<RegistrationResponse[]> {
  const res = await api.get<RegistrationResponse[]>(ENDPOINTS.REGISTRATIONS.ADMIN_ALL)
  return res.data
}
