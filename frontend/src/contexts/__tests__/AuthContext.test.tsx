import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'



jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({
    sub: 'testuser',
    roles: ['ROLE_REGISTRANT']
  }))
}))

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('should provide default unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user).toBeNull()
  })

  it('should update context with token and user profile on login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    act(() => {
      result.current.login('test-token', 'refresh-token')
    })

    expect(result.current.user).not.toBeNull()
    expect(sessionStorage.getItem('jwtToken')).toBe('test-token')
    expect(sessionStorage.getItem('refreshToken')).toBe('refresh-token')
  })

  it('should clear token and user profile on logout', () => {
    sessionStorage.setItem('jwtToken', 'old-token')
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem('jwtToken')).toBeNull()
  })
})
