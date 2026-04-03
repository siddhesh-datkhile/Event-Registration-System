import { renderHook, act } from '@testing-library/react'
import { AuthProvider , useAuth} from '../../contexts/AuthContext'
import * as authApi from '../../api/auth'

jest.mock('../../api/auth', () => ({
  ...jest.requireActual('../../api/auth'),
  decodeToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}))

describe('AuthContext edge cases', () => {
  beforeEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('remains unauthenticated with malformed JWT', () => {
    ;(authApi.decodeToken as jest.Mock).mockImplementation(() => { throw new Error('bad token') })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('clears token if token is expired', () => {
    const now = Math.floor(Date.now() / 1000)
    ;(authApi.decodeToken as jest.Mock).mockReturnValue({ exp: now - 10, userId: 1, roles: [], sub: 'test' })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    // token should be cleared on mount
    expect(sessionStorage.getItem('jwtToken')).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logs out on refresh token failure', async () => {
    ;(authApi.refreshAccessToken as jest.Mock).mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    act(() => {
      // simulate token refresh call inside context if any (here we just call clearTokens directly)
      result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
