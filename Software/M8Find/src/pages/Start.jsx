import '../App.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'

function Start() {
  const navigate = useNavigate()

  return (
  <div id="center">
  <div className="instructionbox"> 
        <h2>Instructions</h2>
        <p>Make sure your phone is horizontally mounted on the handle. Keep the handle connected to the wall surface. </p>
      
      <div className= "buttonGroup">
        <Button onClick={() => navigate('/connect')}>Connect</Button>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div> 
  </div>

      </div>
  )
}

export default Start