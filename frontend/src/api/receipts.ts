import api from './axiosInstance'
import { ENDPOINTS } from './endpoints'


export async function getReceiptHtml(registrationId: number): Promise<string> {
  const res = await api.get(ENDPOINTS.RECEIPTS.BY_REGISTRATION(registrationId), {
    responseType: 'text',
    headers: {
      Accept: 'text/html',
    }
  })
  return res.data
}
