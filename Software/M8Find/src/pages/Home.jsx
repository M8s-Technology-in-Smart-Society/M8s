import '../App.css'
import logo from '../assets/logo.PNG'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialChecks = [
  { name: 'Backend API', detail: 'FastAPI health endpoint', status: 'checking' },
  { name: 'WebSocket', detail: 'Real-time sensor stream', status: 'waiting' },
  { name: 'Data contract', detail: 'Presence, distance, confidence, mode', status: 'waiting' },
  { name: 'Radar pipeline', detail: 'XM125 / mock fallback frame', status: 'waiting' },
  { name: 'Operator UI', detail: 'Dashboard route ready', status: 'waiting' },
]

function Home() {
  const navigate = useNavigate()
  const [checks, setChecks] = useState(initialChecks)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState('unknown')
  const [activeStep, setActiveStep] = useState('Starting system checks...')

  useEffect(() => {
    let ws
    let finished = false

    const update = (name, status) => {
      setChecks(prev => prev.map(c => c.name === name ? { ...c, status } : c))
    }

    async function runChecks() {
      const apiBase = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`
      const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8080/ws`

      try {
        setActiveStep('Checking FastAPI backend...')
        const health = await fetch(`${apiBase}/health`)
        const healthData = await health.json()
        setMode(healthData.mode || 'unknown')
        update('Backend API', health.ok ? 'ok' : 'fail')

        setActiveStep('Opening WebSocket stream...')
        update('WebSocket', 'checking')
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          update('WebSocket', 'ok')
          setActiveStep('Waiting for first radar frame...')
          update('Data contract', 'checking')
          update('Radar pipeline', 'checking')
        }

        ws.onmessage = (event) => {
          if (finished) return
          const data = JSON.parse(event.data)

          const valid =
            'presence' in data &&
            'distance_m' in data &&
            'confidence' in data &&
            'status' in data &&
            'mode' in data

          update('Data contract', valid ? 'ok' : 'fail')
          update('Radar pipeline', data.mode ? 'ok' : 'fail')
          update('Operator UI', 'ok')

          if (valid) {
            finished = true
            setReady(true)
            setActiveStep('System ready for detection.')
            ws.close()
          }
        }

        ws.onerror = () => {
          update('WebSocket', 'fail')
          setActiveStep('WebSocket connection failed.')
        }
      } catch {
        update('Backend API', 'fail')
        update('WebSocket', 'fail')
        setActiveStep('Backend check failed.')
      }
    }

    runChecks()

    return () => {
      finished = true
      if (ws) ws.close()
    }
  }, [])

  return (
    <div className="boot-page">
      <div className="boot-shell">
        <img src={logo} alt="M8Find logo" className="boot-logo-large" />

        <h1>M8Find</h1>
        <p className="boot-description">
          Search & Rescue proof-of-concept for real-time human presence detection
          using radar, mic array, edge processing and dashboard.
        </p>

        <div className="boot-meta">
          <div>
            <span>System mode</span>
            <strong>{mode}</strong>
          </div>
          <div>
            <span>Current step</span>
            <strong className={ready ? 'boot-ready' : 'boot-loading'}>{activeStep}</strong>
          </div>
        </div>

        <div className="boot-check-list">
          {checks.map(check => (
            <div key={check.name} className={`boot-row ${check.status}`}>
              <div className="boot-dot" />
              <div>
                <strong>{check.name}</strong>
                <span>{check.detail}</span>
              </div>
              <em>{check.status}</em>
            </div>
          ))}
        </div>

        <button
          className="boot-start"
          disabled={!ready}
          onClick={() => navigate('/webgl')}
        >
          {ready ? 'Start Detection' : 'Preparing system...'}
        </button>
        <button className="boot-about" onClick={() => navigate('/about')}>
        About project
        </button>
      </div>
    </div>
  )
}

export default Home
