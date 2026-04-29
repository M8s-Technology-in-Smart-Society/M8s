import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SensorProvider } from "./context/SensorContext";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SensorProvider>  {/* ADD */}
        <App />
      </SensorProvider>  {/* ADD */}
    </BrowserRouter>
  </StrictMode>,
)