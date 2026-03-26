import './App.css'
import logo from './assets/logo.PNG'
import Button from "./components/button";

function Home() {
  return (
    <>
        <div className='landingpagebox'>
          <img src={logo} alt="Logo" />
          <h1>M8Find</h1>
          <p>Welcome to M8Find!</p> 
            <Button>Start</Button>
            <Button>About</Button>
        </div>
    </>
  )
}
export default Home