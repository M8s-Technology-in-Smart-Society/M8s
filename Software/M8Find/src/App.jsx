import './App.css'
import logo from './assets/logo.PNG'
import Button from "./components/button";

function Home() {
  return (
    <>
      <section id="center">
        
        <div>
          <img src={logo} alt="Logo" />
          <h1>M8Find</h1>
          <p>Welcome to M8Find!</p> 
            <p><Button>Start</Button></p>
            <p><Button>About</Button></p>
        </div>

      </section>
    </>
  )
}

export default Home