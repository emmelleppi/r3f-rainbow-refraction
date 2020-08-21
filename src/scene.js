import * as THREE from "three";
import React, { useMemo, useEffect, Suspense } from "react";
import {
  createPortal,
  useFrame,
  useThree,
  useLoader,
  useResource,
} from "react-three-fiber";
import { PerspectiveCamera } from "drei";
import { Physics } from "use-cannon";
import {
  EffectComposer,
  SavePass,
  RenderPass,
  EffectPass,
  BloomEffect,
  BlendFunction,
  KernelSize,
  ClearPass,
  GammaCorrectionEffect,
  SSAOEffect,
  SMAAEffect,
  NormalPass,
  SMAAImageLoader,
} from "postprocessing";

import { Mouse } from "./mouse";
import Target from "./target";
import Room from "./room";
import { SPHERES, SPHERES_NUM } from "./store";
import Marble from "./marble";

function usePostprocessing({
  targetScene,
  targetCamera,
  cameraLayer1,
  cameraLayer2,
}) {
  const smaa = useLoader(SMAAImageLoader);
  const { gl, scene, size, camera } = useThree();

  const [
    composer,
    savePassEnv,
    savePassBackface,
    savePassTarget,
  ] = useMemo(() => {
    const composer = new EffectComposer(gl, {
      frameBufferType: THREE.HalfFloatType,
    });

    const savePassTarget = new SavePass();
    const savePassEnv = new SavePass();
    const savePassBackface = new SavePass();

    const renderPass = new RenderPass(scene, camera);
    const renderTargetPass = new RenderPass(targetScene, targetCamera);
    const renderBackfacePass = new RenderPass(scene, cameraLayer2);
    const renderEnvPass = new RenderPass(scene, cameraLayer1);

    const normalPass = new NormalPass(scene, camera);

    const BLOOM = new BloomEffect({
      opacity: 1,
      blendFunction: BlendFunction.SCREEN,
      kernelSize: KernelSize.LARGE,
      luminanceThreshold: 0.6,
      luminanceSmoothing: 0.2,
      height: 300,
    });

    const SMAA = new SMAAEffect(...smaa);
    SMAA.colorEdgesMaterial.setEdgeDetectionThreshold(0.2);
    const aOconfig = {
      blendFunction: BlendFunction.MULTIPLY,
      samples: 4, // May get away with less samples
      rings: 4, // Just make sure this isn't a multiple of samples
      distanceThreshold: 0.2,
      distanceFalloff: 1,
      rangeThreshold: 1, // Controls sensitivity based on camera view distance **
      rangeFalloff: 0.01,
      luminanceInfluence: 0.6,
      radius: 8, // Spread range
      intensity: 5,
      bias: 0.5,
    };
    const AO = new SSAOEffect(
      camera,
      normalPass.renderTarget.texture,
      aOconfig
    );
    const CAO = new SSAOEffect(camera, normalPass.renderTarget.texture, {
      ...aOconfig,
      samples: 21,
      radius: 10,
      intensity: 20,
      luminanceInfluence: 0.6,
      color: "purple",
    });

    const effectPass = new EffectPass(camera, SMAA, CAO, AO, BLOOM);

    const backfaceEffectPass = new EffectPass(
      cameraLayer2,
      new GammaCorrectionEffect({ gamma: 0.5 })
    );
    backfaceEffectPass.encodeOutput = false; // Prevent potential bugs.

    const envEffectPass = new EffectPass(
      cameraLayer1,
      new GammaCorrectionEffect({ gamma: 0.5 })
    );
    backfaceEffectPass.encodeOutput = false; // Prevent potential bugs.

    const clearpass = new ClearPass();

    composer.addPass(renderTargetPass);
    composer.addPass(savePassTarget);
    composer.addPass(clearpass);

    composer.addPass(renderBackfacePass);
    composer.addPass(backfaceEffectPass);
    composer.addPass(savePassBackface);

    composer.addPass(renderEnvPass);
    composer.addPass(envEffectPass);
    composer.addPass(savePassEnv);

    composer.addPass(renderPass);
    composer.addPass(normalPass);
    composer.addPass(effectPass);

    return [composer, savePassEnv, savePassBackface, savePassTarget];
  }, [
    gl,
    scene,
    camera,
    targetScene,
    targetCamera,
    cameraLayer2,
    cameraLayer1,
    smaa,
  ]);

  useEffect(() => void composer.setSize(size.width, size.height), [
    composer,
    size,
  ]);

  useFrame((_, delta) => void composer.render(delta), 1);

  return [savePassEnv, savePassBackface, savePassTarget];
}

function Scene() {
  const [refCameraLayer1, cameraLayer1] = useResource();
  const [refCameraLayer2, cameraLayer2] = useResource();

  const [targetScene, targetCamera] = useMemo(() => {
    const targetCamera = new THREE.PerspectiveCamera();
    targetCamera.position.set(0, 0, 0);
    targetCamera.near = 0.1;
    targetCamera.far = 100;

    const targetScene = new THREE.Scene();

    return [targetScene, targetCamera];
  }, []);

  const [savePassEnv, savePassBackface, savePassTarget] = usePostprocessing({
    targetScene,
    targetCamera,
    cameraLayer1,
    cameraLayer2,
  });

  return (
    <>
      {createPortal(<Target />, targetScene)}
      <PerspectiveCamera
        ref={refCameraLayer1}
        position={[0, 0, 40]}
        fov={50}
        near={0.1}
        far={100}
        layers={1}
      />
      <PerspectiveCamera
        ref={refCameraLayer2}
        position={[0, 0, 40]}
        fov={50}
        near={0.1}
        far={100}
        layers={2}
      />
      <Physics
        gravity={[0, -100, 0]}
        defaultContactMaterial={{ restitution: 0.1 }}
      >
        {SPHERES.map((ref, index) => (
          <Marble
            key={`0${index}`}
            ref={ref}
            prev={SPHERES[(index - 1) % SPHERES_NUM]}
            next={SPHERES[(index + 1) % SPHERES_NUM]}
            map={savePassTarget.renderTarget.texture}
            envMap={savePassEnv.renderTarget.texture}
            backfaceMap={savePassBackface.renderTarget.texture}
          />
        ))}
        <Room />
        <Mouse />
      </Physics>
    </>
  );
}

export default function _Scene() {
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
