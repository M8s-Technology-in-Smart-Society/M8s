import './About.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'

function About() {
  const navigate = useNavigate()

  return (
    <div className ="about-container">
      <h1>About Page</h1>
      <p>Welcome to the About page!</p>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  )
}

export default About