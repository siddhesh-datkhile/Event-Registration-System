import { createPaymentOrder } from '../payments'
import api from '../axiosInstance'

jest.mock('../axiosInstance', () => ({
  post: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

const mockOrder = {
  orderId: 'order_abc123',
  amount: 50000,
  currency: 'INR',
  registrationId: 1,
}

describe('payments API', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('createPaymentOrder', () => {
    it('posts registrationId and returns payment order', async () => {
      mockApi.post.mockResolvedValue({ data: mockOrder })
      const result = await createPaymentOrder(1)
      expect(result).toEqual(mockOrder)
      expect(mockApi.post).toHaveBeenCalledWith(expect.any(String), { registrationId: 1 })
    })

    it('returns order with correct amount', async () => {
      mockApi.post.mockResolvedValue({ data: mockOrder })
      const result = await createPaymentOrder(1)
      expect(result.amount).toBe(50000)
      expect(result.currency).toBe('INR')
    })

    it('propagates error when payment creation fails', async () => {
      mockApi.post.mockRejectedValue({ response: { data: { message: 'Payment gateway error' } } })
      await expect(createPaymentOrder(1)).rejects.toMatchObject({
        response: { data: { message: 'Payment gateway error' } },
      })
    })

    it('propagates error when registration not found', async () => {
      mockApi.post.mockRejectedValue({ response: { status: 404 } })
      await expect(createPaymentOrder(999)).rejects.toMatchObject({ response: { status: 404 } })
    })
  })
})
