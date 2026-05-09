import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import About from './pages/About'
import Start from './pages/Start'
import Connect from './pages/Connect'
import WebGL from './pages/WebGL'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/start" element={<Start />} />
      <Route path="/about" element={<About />} />
      <Route path="/connect" element={<Connect />} />
      <Route path="/WebGL" element={<WebGL />} />
    </Routes>
  )
}

export default App