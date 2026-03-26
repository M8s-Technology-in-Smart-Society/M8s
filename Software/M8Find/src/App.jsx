import './App.css'
import logo from './assets/logo.PNG'
import Button from "./components/button";

function Home() {
  return (
    <div id="center">
      <div className="landingpagebox">
        <img src={logo} alt="Logo" className="img" />
        <h1>M8Find</h1>
        <h2>Welcome to M8Find!</h2>
          <Button>Start</Button>
          <Button>About</Button>
        </div>
      </div>
  )
}

export default Home
