import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Connect.css'

function Connect() {
  const navigate = useNavigate()
  //there can be 3 values:connecting, connected or error
  //set status changes the value and idle is starting value
  const [status, setStatus] = useState('connecting')

  //connect function (FAKE this is NOT the real code this is just for simulation)
  const handleConnect = () => {
    setStatus('connecting')

    setTimeout(() => {
      setStatus('connected')
      setTimeout(() => navigate('/next-page'), 2000)
    }, 2000)
  }

  return (
    <div className="connect-container">
      {status === 'connecting' && (
        <>
          <h2>Connecting...</h2>
          <p>Reaching out to the sensor.</p>
        </>
      )}

      {status === 'connected' && (
        <>
          <h2>Connection Established ✓</h2>
          <p>Taking you to the next page...</p>
        </>
      )}
    </div>
  )
}

export default Connect