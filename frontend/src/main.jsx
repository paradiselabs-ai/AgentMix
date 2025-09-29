import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/enhanced-theme.css'
import App from './App.jsx'
import { ConversationProvider } from './contexts/ConversationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConversationProvider>
      <App />
    </ConversationProvider>
  </StrictMode>,
)
