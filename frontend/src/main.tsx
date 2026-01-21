import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize configuration and services
import { validateConfig } from '@/config/env'
import { initializeSentry } from '@/config/sentry'

// Validate configuration
try {
  validateConfig()
} catch (error) {
  console.error('Configuration validation failed:', error)
}

// Initialize Sentry (optional)
initializeSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)