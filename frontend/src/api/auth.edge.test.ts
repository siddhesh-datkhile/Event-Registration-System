import { saveTokens, clearTokens, getToken, getCurrentUser } from './auth'

describe('API token helper edge cases', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  test('saveTokens stores under both keys', () => {
    saveTokens('jwt123', 'refresh123')
    expect(sessionStorage.getItem('jwtToken')).toBe('jwt123')
    expect(sessionStorage.getItem('token')).toBe('jwt123')
    expect(sessionStorage.getItem('refreshToken')).toBe('refresh123')
  })

  test('clearTokens removes both keys', () => {
    sessionStorage.setItem('jwtToken', 'jwt')
    sessionStorage.setItem('token', 'jwt')
    sessionStorage.setItem('refreshToken', 'ref')
    clearTokens()
    expect(sessionStorage.getItem('jwtToken')).toBeNull()
    expect(sessionStorage.getItem('token')).toBeNull()
    expect(sessionStorage.getItem('refreshToken')).toBeNull()
  })

  test('getToken prefers jwtToken over legacy token', () => {
    sessionStorage.setItem('token', 'legacy')
    sessionStorage.setItem('jwtToken', 'new')
    expect(getToken()).toBe('new')
  })

  test('getCurrentUser fallback for non‑JWT token', () => {
    // token that cannot be decoded (decodeToken will return null)
    sessionStorage.setItem('jwtToken', 'nonjwt')
    const user = getCurrentUser()
    expect(user).toEqual({ id: 0, roles: [], email: 'test@example.com' })
  })
})
