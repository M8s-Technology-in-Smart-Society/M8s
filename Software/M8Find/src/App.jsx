import './App.css'
import logo from './assets/logo.PNG'

function Home() {
  return (
    <>
      <section id="center">
        
        <div>
          <img src={logo} alt="Logo" />
          <h1>M8Find</h1>
          <p>Welcome to M8Find!</p> 
            <p><button className="button">Start</button></p>
            <p><button className="button">About</button></p>
        </div>

      </section>
    </>
  )
}

export default Home