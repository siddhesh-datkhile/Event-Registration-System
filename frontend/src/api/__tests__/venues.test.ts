import { getAllVenues, addVenue } from '../venues'
import api from '../axiosInstance'

jest.mock('../axiosInstance', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

const mockVenue = { id: 1, name: 'Main Hall', address: '123 Main St', city: 'Mumbai' }

describe('venues API', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getAllVenues', () => {
    it('returns list of venues', async () => {
      mockApi.get.mockResolvedValue({ data: [mockVenue] })
      const result = await getAllVenues()
      expect(result).toEqual([mockVenue])
      expect(mockApi.get).toHaveBeenCalledTimes(1)
    })

    it('returns empty array when no venues', async () => {
      mockApi.get.mockResolvedValue({ data: [] })
      const result = await getAllVenues()
      expect(result).toEqual([])
    })

    it('propagates error on failure', async () => {
      mockApi.get.mockRejectedValue(new Error('Server error'))
      await expect(getAllVenues()).rejects.toThrow('Server error')
    })
  })

  describe('addVenue', () => {
    it('posts venue payload and returns created venue', async () => {
      mockApi.post.mockResolvedValue({ data: mockVenue })
      const payload = { name: 'Main Hall', address: '123 Main St', city: 'Mumbai' }
      const result = await addVenue(payload)
      expect(result).toEqual(mockVenue)
      expect(mockApi.post).toHaveBeenCalledWith(expect.any(String), payload)
    })

    it('propagates validation error', async () => {
      mockApi.post.mockRejectedValue({ response: { data: { message: 'Name is required' } } })
      await expect(
        addVenue({ name: '', address: '123', city: 'Mumbai' })
      ).rejects.toMatchObject({ response: { data: { message: 'Name is required' } } })
    })
  })
})
