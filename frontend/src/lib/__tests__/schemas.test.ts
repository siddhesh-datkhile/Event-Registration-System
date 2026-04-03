import { loginSchema, registerSchema, eventSchema } from '../schemas'

describe('Zod Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should pass with valid email and password', () => {
      const data = { email: 'test@example.com', password: 'password123' }
      expect(loginSchema.safeParse(data).success).toBe(true)
    })

    it('should fail if email is invalid format', () => {
      const data = { email: 'not-an-email', password: 'password123' }
      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('should fail if required fields are empty', () => {
      const data = { email: '', password: '' }
      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should pass with valid registrant data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        phone: '1234567890',
        address: '123 Main St',
        dob: '1990-01-01',
        role: 'REGISTRANT'
      }
      expect(registerSchema.safeParse(data).success).toBe(true)
    })

    it('should fail if password is under 6 characters', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        phone: '1234567890',
        address: '123 Main St',
        dob: '1990-01-01',
        role: 'REGISTRANT'
      }
      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters')
      }
    })

    it('should fail if phone number is not exactly 10 digits', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        phone: '123456',
        address: '123 Main St',
        dob: '1990-01-01',
        role: 'REGISTRANT'
      }
      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Enter a valid 10-digit phone number')
      }
    })
  })

  describe('eventSchema', () => {
    it('should pass with valid event data', () => {
      const data = {
        title: 'Tech Meetup',
        description: 'A great tech meetup',
        eventDate: '2023-12-01T10:00:00Z',
        entryFee: 100,
        capacity: 50,
        status: 'OPEN',
        organizerId: 1,
        venueId: 2
      }
      expect(eventSchema.safeParse(data).success).toBe(true)
    })

    it('should fail if entry fee is negative', () => {
      const data = {
        title: 'Tech Meetup',
        description: 'A great tech meetup',
        eventDate: '2023-12-01T10:00:00Z',
        entryFee: -10,
        capacity: 50,
        status: 'OPEN',
        organizerId: 1,
        venueId: 2
      }
      const result = eventSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
         expect(result.error.issues[0].message).toBe('Entry fee cannot be negative')
      }
    })

    it('should fail if capacity is less than 1', () => {
      const data = {
        title: 'Tech Meetup',
        description: 'A great tech meetup',
        eventDate: '2023-12-01T10:00:00Z',
        entryFee: 100,
        capacity: 0,
        status: 'OPEN',
        organizerId: 1,
        venueId: 2
      }
      const result = eventSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
         expect(result.error.issues[0].message).toBe('Capacity must be at least 1')
      }
    })
  })
})
