import api from './axiosInstance'
import { ENDPOINTS } from './endpoints'

import type {  PaymentOrderResponse  } from '../model'

export async function createPaymentOrder(registrationId: number): Promise<PaymentOrderResponse> {
  const res = await api.post<PaymentOrderResponse>(ENDPOINTS.PAYMENTS.CREATE_ORDER, { registrationId })
  return res.data
}
