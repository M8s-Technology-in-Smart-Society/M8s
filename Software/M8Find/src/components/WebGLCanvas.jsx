import '../App.css'
import Button from '../components/button'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Children } from 'react';

export default function WebGLCanvas({children}) {
  const navigate = useNavigate();
//Tänne väripallerot etäisyyden mukaan
  return (
    <div className="webgl_page">
      <div className="canvas_layer">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={["black"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        {children}
        </Canvas>
      </div>
   </div>
  );
}













