import React, { useRef } from "react";
import { Plane } from "drei";

import "./materials/rainbowMaterial";
import { useFrame } from "react-three-fiber";

function Target() {
  const ref = useRef();

  useFrame(({ clock }) => {
    ref.current.material.uniforms.time.value = clock.getElapsedTime() / 4;
  });

  return (
    <Plane ref={ref} position={[0, 0, -1]}>
      <rainbowMaterial resolution={[window.innerWidth, window.innerHeight]} />
    </Plane>
  );
}

export default Target;
