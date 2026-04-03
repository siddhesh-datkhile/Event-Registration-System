import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
  address: z.string().min(1, 'Address is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  role: z.enum(['ORGANIZER', 'REGISTRANT'])
})

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be exactly 10 digits'),
  address: z.string().min(1, 'Address is required'),
  dob: z.string().min(1, 'Date of birth is required')
})

export const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required')
})

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['ORGANIZER', 'REGISTRANT'])
})

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  eventDate: z.string().min(1, 'Date & time is required'),
  entryFee: z.number().min(0, 'Entry fee cannot be negative'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['OPEN', 'CLOSED']),
  organizerId: z.number(),
  venueId: z.number().min(1, 'Venue is required')
})

export type LoginFormSchema = z.infer<typeof loginSchema>
export type RegisterFormSchema = z.infer<typeof registerSchema>
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type VenueSchema = z.infer<typeof venueSchema>
export type UserSchema = z.infer<typeof userSchema>
export type EventSchema = z.infer<typeof eventSchema>
