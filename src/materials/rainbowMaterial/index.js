import { extend } from "react-three-fiber";
import { shaderMaterial } from "drei";

import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

const RainbowMaterial = shaderMaterial(
  { resolution: [0, 0], time: 0, text: null },
  vertex,
  fragment
);

extend({ RainbowMaterial });
