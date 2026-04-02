import './About.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'

function About() {
  const navigate = useNavigate()

  return (
    <div className ="about-container">
      <h2>About</h2>
      <p>This app was made part of a BIP project</p>
      <h2>M8's:</h2>
      <p>Milan, Tony, Anatolia, Tugce, Maija and Saara</p>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  )
}

export default About