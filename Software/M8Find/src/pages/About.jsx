import '../App.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'

function About() {
  const navigate = useNavigate()

  return (
  <div id="center">
    <div className="instructionbox"> 
        <h2>About</h2>
        <p>This app was made part of a Blended Intensive Program (BIP) project during Spring term 2026. </p></div>
        
    <div className="instructionbox">  
        <div className="credits">
            <h2>M8's:</h2>
            <p style={{ fontWeight: "bold"}}>Fontys University of Applied Sciences</p> 
            <p>Milan Smieško,</p> 
            <p>Tony Genev</p> 
            <p style={{ fontWeight: "bold"}}>University of Applied Sciences Technikum Wien</p> 
            <p>Anatolia Coskun,</p> 
            <p>Tugce Demiraslan</p> 
            <p style={{ fontWeight: "bold"}}>Lapland University of Applied Sciences</p> 
            <p>Maija Kuusela,</p> 
            <p>Saara Iltanen</p>
          </div>
    </div>
    <Button className="buttonGroup" onClick={() => navigate('/')}>Back to Home</Button>
    <div></div>
    </div>
  
  )
}

export default About