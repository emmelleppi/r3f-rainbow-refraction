import * as THREE from "three";
import React, { useRef, forwardRef } from "react";
import { useFrame, useThree } from "react-three-fiber";
import { Dodecahedron } from "drei";
import { usePointToPointConstraint, useSphere } from "use-cannon";

import { useDragConstraint } from "./mouse";
import "./materials/backfaceMaterial";
import "./materials/refractionMaterial";

const Marble = forwardRef(function Marble(
  { map, envMap, backfaceMap, prev, next },
  ref
) {
  const RADIUS = 2.4;
  const group = useRef();
  const { size } = useThree();

  const [body] = useSphere(
    () => ({ mass: 1, args: RADIUS, position: [0, 20, 0] }),
    ref
  );

  usePointToPointConstraint(body, prev, {
    pivotA: [RADIUS * 0.9, 0, 0],
    pivotB: [-RADIUS * 0.9, 0, 0],
  });
  usePointToPointConstraint(body, next, {
    pivotA: [-RADIUS * 0.9, 0, 0],
    pivotB: [RADIUS * 0.9, 0, 0],
  });

  const bind = useDragConstraint(body);

  useFrame(() => {
    group.current.position.copy(body.current.position);
    group.current.quaternion.copy(body.current.quaternion);
  });

  return (
    <>
      <mesh ref={body} />
      <group ref={group} {...bind}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <Dodecahedron args={[RADIUS, 0]} castShadow>
            <refractionMaterial
              transparent
              map={map}
              envMap={envMap}
              backfaceMap={backfaceMap}
              resolution={[size.width, size.height]}
            />
          </Dodecahedron>
          <Dodecahedron args={[RADIUS, 0]} layers={2}>
            <backFaceMaterial side={THREE.BackSide} />
          </Dodecahedron>
        </group>
      </group>
    </>
  );
});

export default Marble;
