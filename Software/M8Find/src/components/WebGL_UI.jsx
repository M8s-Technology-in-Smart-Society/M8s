import '../App.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'


export default function WebGL_UI() {
  const navigate = useNavigate();

  return (
    <div className="UI_container">
       <h2>Sensor view</h2>
       
        <h5 UI_container h5>Battery:</h5>
        <h5 UI_container h5>Wifi-signal strength:</h5>
        <h5 UI_container h5>Sensor signal strength:</h5>
   

      <Button onClick={() => navigate('/start')}>Return</Button>
    </div>
  );
}