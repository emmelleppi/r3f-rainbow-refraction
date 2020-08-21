import { createRef } from "react";

export const SPHERES_NUM = 14;
export const SPHERES = new Array(SPHERES_NUM).fill().map(createRef);
export const cursor = createRef();
