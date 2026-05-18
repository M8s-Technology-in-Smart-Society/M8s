import '../App.css'
import logo from '../assets/logo.PNG'
import Button from "../components/button"
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div id="center">
      <div className="landingpagebox">
        <img src={logo} alt="Logo" className="img" />
        <h1>M8Find</h1>
          <div className="buttonGroup">
            <Button onClick={() => navigate('/start')}>Start</Button>
            <Button onClick={() => navigate('/about')}>About</Button>
          </div>
      </div>
    </div>
  ) 
}

export default Home