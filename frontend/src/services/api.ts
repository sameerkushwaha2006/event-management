import axios, { AxiosInstance, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              })

              const { accessToken, refreshToken: newRefreshToken } = response.data.data

              // Update tokens in localStorage
              localStorage.setItem('accessToken', accessToken)
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken)
              }

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        // Handle network errors
        if (!error.response) {
          toast.error('Network error. Please check your connection.')
          return Promise.reject(error)
        }

        // Handle other HTTP errors
        const message = error.response.data?.error || error.response.data?.message || 'An error occurred'

        // Don't show toast for 401 errors (handled above)
        if (error.response.status !== 401) {
          toast.error(message)
        }

        return Promise.reject(error)
      }
    )
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password })
    return response.data
  }

  async register(userData: any) {
    const response = await this.client.post('/auth/register', userData)
    return response.data
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await this.client.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  async refreshToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', { refreshToken })
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email })
    return response.data
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', {
      token,
      newPassword,
    })
    return response.data
  }

  async verifyEmail(token: string) {
    const response = await this.client.get(`/auth/verify-email/${token}`)
    return response.data
  }

  async resendVerificationEmail(email: string) {
    const response = await this.client.post('/auth/resend-verification', { email })
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  }

  async updateProfile(userData: any) {
    const response = await this.client.put('/users/profile', userData)
    return response.data
  }

  async getProfile() {
    const response = await this.client.get('/users/profile')
    return response.data
  }

  // Event methods
  async getEvents(params?: any) {
    const response = await this.client.get('/events', { params })
    return response.data
  }

  async getEvent(id: string) {
    const response = await this.client.get(`/events/${id}`)
    return response.data
  }

  async createEvent(eventData: any) {
    const response = await this.client.post('/events', eventData)
    return response.data
  }

  async updateEvent(id: string, eventData: any) {
    const response = await this.client.put(`/events/${id}`, eventData)
    return response.data
  }

  async deleteEvent(id: string) {
    const response = await this.client.delete(`/events/${id}`)
    return response.data
  }

  async registerForEvent(eventId: string, registrationData: any) {
    const response = await this.client.post(`/events/${eventId}/register`, registrationData)
    return response.data
  }

  // User methods
  async getMyEvents(params?: any) {
    const response = await this.client.get('/users/my-events', { params })
    return response.data
  }

  async getMyRegistrations() {
    const response = await this.client.get('/users/my-registrations')
    return response.data
  }

  async getMyTickets() {
    const response = await this.client.get('/users/my-tickets')
    return response.data
  }

  // Payment methods
  async createPaymentIntent(paymentData: any) {
    const response = await this.client.post('/payments/create-intent', paymentData)
    return response.data
  }

  async confirmPayment(paymentData: any) {
    const response = await this.client.post('/payments/confirm', paymentData)
    return response.data
  }

  // Generic HTTP methods
  async get(url: string, params?: any) {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post(url: string, data?: any) {
    const response = await this.client.post(url, data)
    return response.data
  }

  async put(url: string, data?: any) {
    const response = await this.client.put(url, data)
    return response.data
  }

  async delete(url: string) {
    const response = await this.client.delete(url)
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient