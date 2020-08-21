import { extend } from "react-three-fiber";
import { shaderMaterial } from "drei";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const RefractionMaterial = shaderMaterial(
  { resolution: [0, 0], map: null, envMap: null, backfaceMap: null },
  vertex,
  fragment
);

extend({ RefractionMaterial });
