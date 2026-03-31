import api from './axiosInstance'

export async function getReceiptHtml(registrationId: number): Promise<string> {
  const res = await api.get(`/api/receipts/${registrationId}`, {
    responseType: 'text',
    headers: {
      Accept: 'text/html',
    }
  })
  return res.data
}
