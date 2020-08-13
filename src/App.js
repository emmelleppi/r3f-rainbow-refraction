import React from 'react'
import { Canvas } from 'react-three-fiber'
import { PerspectiveCamera } from 'drei'

import Scene from './Scene'

export default function App() {
  return (
    <Canvas
      concurrent
      colorManagement
      gl={{
        powerPreference: 'high-performance',
        antialias: false,
        stencil: false,
        depth: false
      }}>
      <PerspectiveCamera makeDefault position={[0, 0, 40]} near={0.1} far={100}  />
      <ambientLight intensity={0.5} />
      <Scene />
    </Canvas>
  )
}