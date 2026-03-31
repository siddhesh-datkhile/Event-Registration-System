export interface Venue {
  id: number
  name: string
  address: string
  city: string
  createdAt?: string
  updatedAt?: string
}

export interface RegistrationResponse {
  id: number
  userId: number
  eventId: number
  registrationDate: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone: string
  address: string
  dob: string
  role: 'ORGANIZER' | 'REGISTRANT'
}

export interface UpdateProfileRequest {
  name: string
  phone: string
  address: string
  dob: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: UserProfileResponse
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface UserProfileResponse {
  id: number
  name: string
  email: string
  phone: string
  address: string
  dob: string
  role: string
}

export type EventStatus = 'OPEN' | 'CLOSED'

export interface Event {
  id: number
  title: string
  description: string
  eventDate: string
  entryFee: number
  capacity: number
  availableSeats: number
  status: EventStatus
  organizerId: number
  venueId: number
  createdAt: string
  updatedAt: string
}

export interface PaymentOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  status: string
  message: string
}
