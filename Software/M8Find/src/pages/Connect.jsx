import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Connect.css'

function Connect() {
  const navigate = useNavigate()
  //there can be 3 values: connect, connecting and error
  const [status, setStatus] = useState('connecting')

  //this is not the final code, this is just for simulation
  //takes you to the webgl page after 2 seconds
  useEffect(() => {
    setTimeout(() => {
      setStatus('connected')
      setTimeout(() => navigate('/WebGL'), 2000)
    }, 2000)
  }, [])

  return (
    <div>
      {status === 'connecting' && (
        <>
          <h2>Connecting...</h2>
        </>
      )}
      {status === 'connected' && (
        <>
          <h2>Connection established ✓</h2>
        </>
      )}
    </div>
  )
}

export default Connect