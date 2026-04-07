import {
  getMyRegistrations,
  createRegistration,
  cancelRegistration,
  getEventRegistrations,
  getAllRegistrations,
} from '../registrations'
import api from '../axiosInstance'

jest.mock('../axiosInstance', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

const mockRegistration = {
  id: 1,
  eventId: 10,
  userId: 5,
  status: 'CONFIRMED',
  registrationDate: '2026-04-01T10:00:00',
}

describe('registrations API', () => {
  beforeEach(() => jest.clearAllMocks())

  // test cases for getMyRegistrations
  describe('getMyRegistrations', () => {
    it('returns list of user registrations', async () => {
      mockApi.get.mockResolvedValue({ data: [mockRegistration] })
      const result = await getMyRegistrations()
      expect(result).toEqual([mockRegistration])
    })
    // test case for empty array
    it('returns empty array when no registrations', async () => {
      mockApi.get.mockResolvedValue({ data: [] })
      const result = await getMyRegistrations()
      expect(result).toEqual([])
    })
    // test case for error
    it('propagates error on failure', async () => {
      mockApi.get.mockRejectedValue(new Error('Unauthorized'))
      await expect(getMyRegistrations()).rejects.toThrow('Unauthorized')
    })
  })

  describe('createRegistration', () => {
    it('posts eventId and returns registration', async () => {
      mockApi.post.mockResolvedValue({ data: mockRegistration })
      const result = await createRegistration(10)
      expect(result).toEqual(mockRegistration)
      expect(mockApi.post).toHaveBeenCalledWith(expect.any(String), { eventId: 10 })
    })

    it('propagates error when event is full', async () => {
      mockApi.post.mockRejectedValue({ response: { data: { message: 'Event is full' } } })
      await expect(createRegistration(10)).rejects.toMatchObject({
        response: { data: { message: 'Event is full' } },
      })
    })
  })

  describe('cancelRegistration', () => {
    it('posts to cancel endpoint and returns updated registration', async () => {
      const cancelled = { ...mockRegistration, status: 'CANCELLED' }
      mockApi.post.mockResolvedValue({ data: cancelled })
      const result = await cancelRegistration(1)
      expect(result.status).toBe('CANCELLED')
    })

    it('propagates error on failure', async () => {
      mockApi.post.mockRejectedValue(new Error('Not found'))
      await expect(cancelRegistration(999)).rejects.toThrow('Not found')
    })
  })

  describe('getEventRegistrations', () => {
    it('returns registrations for a given event', async () => {
      mockApi.get.mockResolvedValue({ data: [mockRegistration] })
      const result = await getEventRegistrations(10)
      expect(result).toEqual([mockRegistration])
    })

    it('works with string eventId', async () => {
      mockApi.get.mockResolvedValue({ data: [mockRegistration] })
      const result = await getEventRegistrations('10')
      expect(result).toEqual([mockRegistration])
    })
  })

  describe('getAllRegistrations', () => {
    it('returns all registrations (admin)', async () => {
      mockApi.get.mockResolvedValue({ data: [mockRegistration] })
      const result = await getAllRegistrations()
      expect(result).toEqual([mockRegistration])
    })

    it('propagates error on 403', async () => {
      mockApi.get.mockRejectedValue({ response: { status: 403 } })
      await expect(getAllRegistrations()).rejects.toMatchObject({ response: { status: 403 } })
    })
  })
})
