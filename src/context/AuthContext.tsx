import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginForm, RegisterForm, AuthState } from '@/types';
import { mockApi } from '@/services/mockApi';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (userData: RegisterForm) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        role: action.payload.role,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        role: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        role: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  role: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing auth state on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const currentUserData = localStorage.getItem('currentUser');

      if (token && currentUserData) {
        try {
          // Verify token is still valid (mock implementation)
          const tokenData = JSON.parse(atob(token));
          const now = Date.now();
          const tokenAge = now - tokenData.timestamp;

          // Token expires after 24 hours
          if (tokenAge > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
            return;
          }

          // Verify user still exists
          const response = await mockApi.getCurrentUser();
          if (response.success && response.data) {
            dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid session' });
          }
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginForm): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await mockApi.login(credentials);

      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
        toast.success('Login successful!');
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Login failed' });
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (userData: RegisterForm): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await mockApi.register(userData);

      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
        toast.success('Registration successful!');
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.error || 'Registration failed' });
        toast.error(response.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await mockApi.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if API call fails, clear local state
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      toast.success('Logged out successfully');
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};