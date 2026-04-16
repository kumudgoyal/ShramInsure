import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 4000,
      style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: '12px' }}} />
  </React.StrictMode>
)
