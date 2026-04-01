import axios from 'axios'
import { getToken, refreshAccessToken, saveTokens, clearTokens } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request automatically (if present)
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token')
  const token: string | null = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Automatically handle 401 errors and refresh the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/register')) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken)
          saveTokens(accessToken, newRefreshToken)
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // If refresh fails (e.g., refresh token expired), log out the user
          clearTokens()
          window.location.href = '/login'
        }
      } else {
        // No refresh token available
        clearTokens()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
