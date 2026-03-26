import './App.css'
import logo from './assets/logo.PNG'
import Button from "./components/button";

function Home() {
  return (
    <>
        <div className='landingpagebox'>
          <img src={logo} alt="Logo" className='img' />
          <h1>M8Find</h1>
          <p><h2>Welcome to M8Find!</h2></p> 
            <Button>Start</Button>
            <Button>About</Button>
        </div>
    </>
  )
}
export default Home