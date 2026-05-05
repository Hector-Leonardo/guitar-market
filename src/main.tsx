import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { VERSION } from './version'

// Log version on startup
console.log(VERSION)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
