import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

import { User, LoginData, RegisterData, AuthResponse } from '@/types/auth'
import apiClient from '@/services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: { accessToken: string; refreshToken: string } } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }

    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginData) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const storedUser = localStorage.getItem('user')

      if (accessToken && refreshToken && storedUser) {
        try {
          // Validate token by getting current user
          const response = await apiClient.getCurrentUser()
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              tokens: { accessToken, refreshToken },
            },
          })
        } catch (error) {
          // Token is invalid, clear everything
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'LOGOUT' })
      }
    }

    initAuth()
  }, [])

  // Store tokens and user data when auth state changes
  useEffect(() => {
    if (state.user && state.isAuthenticated) {
      localStorage.setItem('user', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('user')
    }
  }, [state.user, state.isAuthenticated])

  const login = async (credentials: LoginData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response: AuthResponse = await apiClient.login(credentials.email, credentials.password)

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          },
        },
      })

      toast.success(`Welcome back, ${response.user.firstName}!`)
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message)
      throw error
    }
  }

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })

      const response: AuthResponse = await apiClient.register(userData)

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          },
        },
      })

      toast.success('Registration successful! Welcome to EventHub!')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Registration failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout()
    } catch (error) {
      // Ignore logout errors
    } finally {
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await apiClient.updateProfile(userData)
      dispatch({ type: 'UPDATE_USER', payload: response.data.user })
      toast.success('Profile updated successfully')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Profile update failed'
      toast.error(message)
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Password change failed'
      toast.error(message)
      throw error
    }
  }

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await apiClient.forgotPassword(email)
      toast.success('Password reset email sent')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to send reset email'
      toast.error(message)
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.resetPassword(token, newPassword)
      toast.success('Password reset successful')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Password reset failed'
      toast.error(message)
      throw error
    }
  }

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await apiClient.verifyEmail(token)
      toast.success('Email verified successfully')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Email verification failed'
      toast.error(message)
      throw error
    }
  }

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      await apiClient.resendVerificationEmail(email)
      toast.success('Verification email sent')
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to send verification email'
      toast.error(message)
      throw error
    }
  }

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext