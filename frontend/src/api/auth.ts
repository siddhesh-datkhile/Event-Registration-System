import api from './axiosInstance'

// ── Request types (matching backend DTOs) ──────────────────────────────────

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
  dob: string        // ISO date string: "YYYY-MM-DD"  (maps to LocalDate)
  role: 'ORGANIZER' | 'REGISTRANT'
}

// ── Response types ─────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  refreshToken: string
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

/** Generic wrapper returned by every auth endpoint */
interface ApiResponse<T> {
  message: string
  data: T
  status: number
}

// ── API functions ──────────────────────────────────────────────────────────

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<ApiResponse<LoginResponse>>('/api/auth/login', payload)
  return res.data.data
}

export async function register(payload: RegisterRequest): Promise<UserProfileResponse> {
  const res = await api.post<ApiResponse<UserProfileResponse>>('/api/auth/register', payload)
  return res.data.data
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse> {
  const res = await api.post<TokenRefreshResponse>('/api/auth/refreshtoken', { refreshToken })
  return res.data
}

// ── Token helpers (localStorage) ───────────────────────────────────────────

export function saveTokens(token: string, refreshToken: string) {
  localStorage.setItem('token', token)
  localStorage.setItem('refreshToken', refreshToken)
  window.dispatchEvent(new Event('auth-change'))
}

export function clearTokens() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  window.dispatchEvent(new Event('auth-change'))
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
