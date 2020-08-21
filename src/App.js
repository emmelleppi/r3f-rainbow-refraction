import React from "react";
import { Canvas } from "react-three-fiber";
import { PerspectiveCamera } from "drei";

import Scene from "./scene";

export default function App() {
  return (
    <Canvas
      shadowMap
      concurrent
      colorManagement
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false,
      }}
      onCreated={({ gl }) => gl.setClearColor(0x038f6c)}
    >
      <fog attach="fog" args={[0x000000, 10, 100]} />
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 40]}
        fov={50}
        near={0.1}
        far={100}
      />
      <ambientLight intensity={0.6} />
      <spotLight
        color="pink"
        position={[20, 10, 40]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        color="pink"
        position={[-20, 10, 40]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Scene />
    </Canvas>
  );
}
