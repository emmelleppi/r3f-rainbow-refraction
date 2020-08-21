import * as THREE from "three";
import React, { useMemo } from "react";
import { useThree } from "react-three-fiber";
import { Plane, useTextureLoader } from "drei";
import { usePlane } from "use-cannon";

function PhyPlane({ scale, color, transparent, texture, ...props }) {
  const [body] = usePlane(() => ({ ...props }));
  const [flakes] = useTextureLoader(["/flakes.png"]);

  return transparent ? null : (
    <>
      <Plane layers={1} {...props} scale={scale}>
        <meshBasicMaterial color={color || 0xffffff} map={texture || null} />
      </Plane>
      <Plane scale={scale} ref={body} receiveShadow>
        <meshPhysicalMaterial
          roughness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color={color || 0xffffff}
          map={texture || null}
          normalMap={texture ? null : flakes}
          normalScale={[1.4, 1.4]}
        />
      </Plane>
    </>
  );
}

function Room() {
  const { viewport, aspect } = useThree();

  // <a href="http://www.freepik.com">Designed by BiZkettE1 / Freepik</a>
  const texture = useTextureLoader("/background_4.jpg");

  useMemo(() => (texture.minFilter = THREE.LinearFilter), [texture]);

  const adaptedHeight =
    3800 *
    (aspect > 5000 / 3800 ? viewport.width / 5000 : viewport.height / 3800);
  const adaptedWidth =
    5000 *
    (aspect > 5000 / 3800 ? viewport.width / 5000 : viewport.height / 3800);

  return (
    <>
      <PhyPlane
        color={0x038f6c}
        scale={[adaptedWidth, adaptedHeight, 1]}
        position={[0, -viewport.height / 2 + 4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <PhyPlane
        color={0x038f6c}
        scale={[adaptedWidth, adaptedHeight, 1]}
        position={[-viewport.width / 2 - 1, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <PhyPlane
        color={0x038f6c}
        scale={[adaptedWidth, adaptedHeight, 1]}
        position={[viewport.width / 2 + 1, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <PhyPlane
        scale={[adaptedWidth, adaptedHeight, 1]}
        position={[0, 0, -10]}
        rotation={[0, 0, 0]}
        texture={texture}
      />
      <PhyPlane
        scale={[adaptedWidth, adaptedHeight, 1]}
        position={[0, 0, 5]}
        rotation={[0, -Math.PI, 0]}
        transparent
      />
    </>
  );
}

export default Room;
