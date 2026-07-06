import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CustomerFlowProvider } from './context/CustomerFlowProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CustomerFlowProvider>
        <App />
      </CustomerFlowProvider>
    </BrowserRouter>
  </StrictMode>,
)
