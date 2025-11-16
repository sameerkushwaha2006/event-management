import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { UIState } from '@/types';

interface UIContextType extends UIState {
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  showNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
  hideNotification: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

type UIAction =
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SHOW_NOTIFICATION'; payload: { message: string; severity: 'success' | 'error' | 'warning' | 'info' } }
  | { type: 'HIDE_NOTIFICATION' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' };

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        notification: {
          open: true,
          message: action.payload.message,
          severity: action.payload.severity,
        },
      };
    case 'HIDE_NOTIFICATION':
      return {
        ...state,
        notification: null,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  loading: false,
  notification: null,
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Load theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && savedTheme !== state.theme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Save theme to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('theme', state.theme);

    // Apply theme to document root
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message, severity } });
  };

  const hideNotification = () => {
    dispatch({ type: 'HIDE_NOTIFICATION' });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const value: UIContextType = {
    ...state,
    setSidebarOpen,
    setLoading,
    showNotification,
    hideNotification,
    setTheme,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};