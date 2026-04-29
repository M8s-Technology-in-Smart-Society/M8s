/*
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
  */

import '../App.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'

export default function WebGL_UI({ distance, status }) {
  const navigate = useNavigate();

  const statusColor =
    status === "Connected" ? "#4ade80" :
    status === "Error"     ? "#f87171" : "#facc15";

  return (
    <div className="UI_container">
      <h2>Sensor view</h2>

      <h5>Battery:</h5>
      <h5>Wifi-signal strength:</h5>
      <h5>Sensor signal strength:</h5>
      <h5>Status: <span style={{ color: statusColor }}>{status}</span></h5>
      <h5>Distance: {distance !== null ? `${distance.toFixed(2)} cm` : "No data"}</h5>

      <Button onClick={() => navigate('/start')}>Return</Button>
    </div>
  );
}