import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'react-hot-toast'
import App from './App'
import theme from './styles/theme'
import { AuthProvider } from './context/AuthContext'
import { EventsProvider } from './context/EventsContext'
import { UIProvider } from './context/UIContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UIProvider>
          <AuthProvider>
            <EventsProvider>
              <App />
              <Toaster position="top-right" />
            </EventsProvider>
          </AuthProvider>
        </UIProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)