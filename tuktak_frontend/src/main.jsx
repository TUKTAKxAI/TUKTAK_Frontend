import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CustomerFlowProvider } from './context/CustomerFlowProvider.jsx'
// 추가
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CustomerFlowProvider>
          <App />
        </CustomerFlowProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
