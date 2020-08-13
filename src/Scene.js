import * as THREE from 'three'
import React, { useRef, useMemo, useEffect, Suspense } from 'react'
import { createPortal, useFrame, useThree, useResource } from 'react-three-fiber'
import { Plane, useTextureLoader, PerspectiveCamera, Torus } from 'drei'
import { EffectComposer, SavePass, RenderPass, EffectPass, BloomEffect, BlendFunction, KernelSize, ChromaticAberrationEffect, GlitchEffect, NoiseEffect } from 'postprocessing'
import "./materials/backfaceMaterial"
import "./materials/refractionMaterial"
import "./materials/rainbowMaterial"

function Target() {
  const mat = useRef()

  useFrame(({ clock }) => void (mat.current.uniforms.time.value = clock.getElapsedTime()));

  return (
    <Plane position={[0, 0, -1]}>
      <rainbowMaterial 
        ref={mat} 
        resolution={[window.innerWidth, window.innerHeight]}
      />
    </Plane>
  )
}

function MySphere({
  position,
  map,
  envMap,
  backfaceMap,
  resolution,
}) {

  const ref = useRef()

  useFrame(() => {
    ref.current.rotation.x += 0.01
    ref.current.rotation.y += 0.01
    ref.current.rotation.z += 0.01
  })

  return (
    <group ref={ref} position={position}>
      <Torus args={[3,2,64, 64]} layers={0}>
        <refractionMaterial
          transparent
          map={map}
          envMap={envMap}
          backfaceMap={backfaceMap}
          resolution={resolution}
        />
      </Torus>
      <Torus args={[3,2,64, 64]} layers={2} >
        <backFaceMaterial side={THREE.BackSide} />
      </Torus>
    </group>
  )
}

function Cube() {
  const group = useRef()

  const [refCameraLayer1, cameraLayer1] = useResource()
  const [refCameraLayer2, cameraLayer2] = useResource()

  const { gl, scene, size, camera } = useThree()
  
  const [targetScene, targetCamera] = useMemo(() => {
    const targetCamera = new THREE.PerspectiveCamera()
    targetCamera.position.set(0, 0, 0)
    targetCamera.near = 0.1
    targetCamera.far = 100

    const targetScene = new THREE.Scene()
    
    return [targetScene, targetCamera]
  }, [])

  const perturbationMap = useTextureLoader("/perturb.jpg");

  const [
    composer,
    savePassEnv,
    savePassBackface,
    savePassTarget,
  ] = useMemo(() => {

    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType })

    const savePassTarget = new SavePass()
    const savePassEnv = new SavePass()
    const savePassBackface = new SavePass()

    const renderPass = new RenderPass(scene, camera)
    const renderTargetPass = new RenderPass(targetScene, targetCamera)
    const renderBackfacePass = new RenderPass(scene, cameraLayer2)
    const renderEnvPass = new RenderPass(scene, cameraLayer1)


    const CHROMATIC_ABERRATION = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.01, 0.01),
    });

    const GLITCH = new GlitchEffect({
      perturbationMap,
      chromaticAberrationOffset: CHROMATIC_ABERRATION.offset,
    });

    const NOISE = new NoiseEffect({
      blendFunction: BlendFunction.COLOR_DODGE,
    });
    NOISE.blendMode.opacity.value = 0.01;
    
    const voidTargetGlitchPass = new EffectPass(targetCamera, GLITCH, NOISE);
    const voidTargetChromaticAberrationPass = new EffectPass( targetCamera, CHROMATIC_ABERRATION );


    const effectPass = new EffectPass(
      camera,
      new BloomEffect({
        opacity: 1,
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.LARGE,
        luminanceThreshold: 0.7,
        luminanceSmoothing: 0.2,
        height: 300,
      })
    );

    composer.addPass(renderEnvPass)
    composer.addPass(savePassEnv)
    
    composer.addPass(renderBackfacePass)
    composer.addPass(savePassBackface)

    composer.addPass(renderTargetPass)
    composer.addPass(voidTargetGlitchPass)
    composer.addPass(voidTargetChromaticAberrationPass)
    composer.addPass(savePassTarget)
    
    composer.addPass(renderPass)
    composer.addPass(effectPass)

    return [
      composer,
      savePassEnv,
      savePassBackface,
      savePassTarget,
    ]
  }, [gl, scene, camera, targetScene, targetCamera, cameraLayer2, cameraLayer1, perturbationMap])

  useEffect(() => void (composer.setSize(size.width, size.height)), [composer, size])

  useFrame(({ camera }, delta) => {
    composer.render(delta)
    refCameraLayer1.current.position.copy(camera.position);
    refCameraLayer1.current.quaternion.copy(camera.quaternion);
    refCameraLayer2.current.position.copy(camera.position);
    refCameraLayer2.current.quaternion.copy(camera.quaternion);
    group.current.rotation.z += 0.01
  }, 1)
  
  return (
    <>
      {createPortal(<Target />, targetScene)}
      <PerspectiveCamera ref={refCameraLayer1} near={0.1} far={100} layers={1} />
      <PerspectiveCamera ref={refCameraLayer2} near={0.1} far={100} layers={2} />
      <group ref={group} position={[0, 0, 5]}>
        {new Array(5).fill().map((_, index) => (
          <MySphere
            key={`0${index}`}
            position={[10 * Math.sin(2 * Math.PI * index / 5), 10 * Math.cos(2 * Math.PI * index / 5), 0]}
            map={savePassTarget.renderTarget.texture}
            envMap={savePassEnv.renderTarget.texture}
            backfaceMap={savePassBackface.renderTarget.texture}
            resolution={[size.width, size.height]}
          />
        ))}
      </group>
    </>
  )
}

function Background() {
  const { viewport, aspect } = useThree()

  // <a href="http://www.freepik.com">Designed by Freepik</a>
  const texture = useTextureLoader("/background_1.jpg")

  useMemo(() => (texture.minFilter = THREE.LinearFilter), [texture])

  const adaptedHeight = 1 * 3800 * (aspect > 5000 / 3800 ? viewport.width / 5000 : viewport.height / 3800)
  const adaptedWidth = 1 * 5000 * (aspect > 5000 / 3800 ? viewport.width / 5000 : viewport.height / 3800)

  return (
    <>
    <Plane
      depthTest={false}
      layers={1}
      scale={[adaptedWidth, adaptedHeight, 1]}
    >
      <meshBasicMaterial map={texture} />
    </Plane>
    <Plane
      depthTest={false}
      layers={0}
      scale={[adaptedWidth, adaptedHeight, 1]}
    >
      <meshBasicMaterial map={texture} />
    </Plane>
    </>
  )
}

export default function Scene() {
  return (
      <Suspense fallback={null}>
        <Cube />
        <Background />
      </Suspense>
  )
}