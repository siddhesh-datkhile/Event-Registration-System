import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../events'
import api from '../axiosInstance'

jest.mock('../axiosInstance', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

const mockEvent = {
  id: 1,
  title: 'Test Event',
  description: 'A test event',
  eventDate: '2026-06-01T10:00:00',
  entryFee: 500,
  capacity: 100,
  status: 'OPEN' as const,
  organizerId: 2,
  venueId: 3,
}

describe('events API', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('getAllEvents', () => {
    it('returns list of events', async () => {
      mockApi.get.mockResolvedValue({ data: [mockEvent] })
      const result = await getAllEvents()
      expect(result).toEqual([mockEvent])
      expect(mockApi.get).toHaveBeenCalledTimes(1)
    })

    it('returns empty array when no events', async () => {
      mockApi.get.mockResolvedValue({ data: [] })
      const result = await getAllEvents()
      expect(result).toEqual([])
    })

    it('propagates error on failure', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))
      await expect(getAllEvents()).rejects.toThrow('Network error')
    })
  })

  describe('getEventById', () => {
    it('returns event by numeric id', async () => {
      mockApi.get.mockResolvedValue({ data: mockEvent })
      const result = await getEventById(1)
      expect(result).toEqual(mockEvent)
    })

    it('returns event by string id', async () => {
      mockApi.get.mockResolvedValue({ data: mockEvent })
      const result = await getEventById('1')
      expect(result).toEqual(mockEvent)
    })

    it('propagates 404 error', async () => {
      mockApi.get.mockRejectedValue({ response: { status: 404 } })
      await expect(getEventById(999)).rejects.toMatchObject({ response: { status: 404 } })
    })
  })

  describe('createEvent', () => {
    it('posts event data and returns created event', async () => {
      mockApi.post.mockResolvedValue({ data: mockEvent })
      const payload = { title: 'Test Event', entryFee: 500 }
      const result = await createEvent(payload)
      expect(result).toEqual(mockEvent)
      expect(mockApi.post).toHaveBeenCalledWith(expect.any(String), payload)
    })

    it('propagates error on failure', async () => {
      mockApi.post.mockRejectedValue(new Error('Bad request'))
      await expect(createEvent({})).rejects.toThrow('Bad request')
    })
  })

  describe('updateEvent', () => {
    it('puts updated data and returns updated event', async () => {
      const updated = { ...mockEvent, title: 'Updated' }
      mockApi.put.mockResolvedValue({ data: updated })
      const result = await updateEvent(1, { title: 'Updated' })
      expect(result).toEqual(updated)
      expect(mockApi.put).toHaveBeenCalledWith(expect.any(String), { title: 'Updated' })
    })
  })

  describe('deleteEvent', () => {
    it('deletes event and returns void', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined })
      await expect(deleteEvent(1)).resolves.toBeUndefined()
      expect(mockApi.delete).toHaveBeenCalledTimes(1)
    })

    it('propagates error on failure', async () => {
      mockApi.delete.mockRejectedValue(new Error('Not found'))
      await expect(deleteEvent(999)).rejects.toThrow('Not found')
    })
  })
})
