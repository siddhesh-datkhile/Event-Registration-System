import api from './axiosInstance'
import type {  LoginRequest, RegisterRequest, UpdateProfileRequest, LoginResponse, TokenRefreshResponse, UserProfileResponse  } from '../model'

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

export async function fetchUserProfile(id: number): Promise<UserProfileResponse> {
  const res = await api.get<UserProfileResponse>(`/api/auth/user/${id}`)
  return res.data
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<UserProfileResponse> {
  const res = await api.put<UserProfileResponse>('/api/auth/user/profile', payload)
  return res.data
}


// ── Admin endpoints ────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<UserProfileResponse[]> {
  const res = await api.get<UserProfileResponse[]>('/api/auth/admin/users')
  return res.data
}

export async function addOrganizer(payload: Partial<RegisterRequest>): Promise<UserProfileResponse> {
  const res = await api.post<UserProfileResponse>('/api/auth/admin/organizer', payload)
  return res.data
}

export async function addRegistrant(payload: Partial<RegisterRequest>): Promise<UserProfileResponse> {
  const res = await api.post<UserProfileResponse>('/api/auth/admin/registrants', payload)
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

export function decodeToken(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export function getCurrentUser() {
  const token = getToken()
  if (!token) return null
  const decoded = decodeToken(token)
  return decoded ? { id: decoded.userId, roles: decoded.roles, email: decoded.sub } : null
}
