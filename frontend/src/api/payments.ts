import api from './axiosInstance'

export interface PaymentOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  status: string
  message: string
}

export async function createPaymentOrder(registrationId: number): Promise<PaymentOrderResponse> {
  const res = await api.post<PaymentOrderResponse>('/api/payments/create-order', { registrationId })
  return res.data
}
