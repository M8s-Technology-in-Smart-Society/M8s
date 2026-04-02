import './App.css'
import logo from './assets/logo.PNG'
import Button from "./components/button"
import { Routes, Route, useNavigate } from 'react-router-dom'
import About from './pages/About'
import Start from './pages/Start'
import Connect from './pages/Connect'

function Home() {
  const navigate = useNavigate()

  return (
    <div id="center">
      <div className="landingpagebox">
        <img src={logo} alt="Logo" className="img" />
        <h1>M8Find</h1>
        <h2>Welcome to M8Find!</h2>
        <Button onClick={() => navigate('/start')}>Start</Button>
        <Button onClick={() => navigate('/about')}>About</Button>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/start" element={<Start />} />
      <Route path="/about" element={<About />} />
      <Route path="/connect" element={<Connect />} />
    </Routes>
  )
}

export default App