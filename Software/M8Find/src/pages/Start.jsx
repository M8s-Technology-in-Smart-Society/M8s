import './Start.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'

function Start() {
  const navigate = useNavigate()

  return (
    <div className ="start-container">
      <h2>Instructions</h2>
      <p>Make sure your phone is securely mounted on the handle. </p>
      <p>Keep the handle connected to the wall surface. </p>
      <Button className="connect-button" onClick={() => navigate('/')}>Connect</Button>
      <Button className="back-button" onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  )
}

export default Start