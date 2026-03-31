import api from './axiosInstance'
import type {  PaymentOrderResponse  } from '../model'

export async function createPaymentOrder(registrationId: number): Promise<PaymentOrderResponse> {
  const res = await api.post<PaymentOrderResponse>('/api/payments/create-order', { registrationId })
  return res.data
}
