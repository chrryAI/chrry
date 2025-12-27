// @ts-nocheck - React Three Fiber JSX elements
import { useRef, useMemo } from "react"
import { Canvas, useFrame, extend } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import * as THREE from "three"

interface ParticleWaveProps {
  entered?: boolean
}

// Define the "Digital Ash" Shader for the face
const FaceShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(1.0, 1.0, 1.0),
    uMouse: new THREE.Vector2(0, 0),
    uExplosion: 0,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uExplosion;
    attribute float aRandom;
    
    varying float vAlpha;
    varying float vDepth;

    void main() {
      vec3 pos = position;
      float time = uTime * 0.3;
      
      // Subtle breathing/pulsing effect
      float pulse = sin(time * 2.0) * 0.02;
      pos *= 1.0 + pulse;
      
      // Add slight noise movement (digital glitch)
      pos.x += sin(time * 3.0 + aRandom * 10.0) * 0.01;
      pos.y += cos(time * 2.0 + aRandom * 10.0) * 0.01;
      pos.z += sin(time * 4.0 + aRandom * 20.0) * 0.005;
      
      // Explosion effect
      if (uExplosion > 0.0) {
        vec3 explosionDir = normalize(pos);
        pos += explosionDir * uExplosion * 5.0 * (0.5 + aRandom);
        pos.x += sin(time * 10.0 + aRandom * 50.0) * uExplosion;
        pos.y += cos(time * 10.0 + aRandom * 50.0) * uExplosion;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size based on depth and randomness
      gl_PointSize = (1.5 + aRandom * 1.5) * (8.0 / -mvPosition.z);
      
      // Alpha based on depth for 3D effect
      vDepth = -mvPosition.z;
      vAlpha = 0.4 + 0.6 * aRandom;
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying float vAlpha;
    varying float vDepth;

    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // Softer edges
      float alpha = vAlpha * (1.0 - r * 2.0);
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
)

extend({ FaceShaderMaterial })

// Generate a dense, horizontal cloud of particles around the title
function generateHeadPoints(count: number) {
  const positions: number[] = []
  const randoms: number[] = []

  for (let i = 0; i < count; i++) {
    // Generate a point in a horizontal ellipsoid (cloud shape)
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)

    // Concentrate particles more towards the center
    const r = 2.2 * Math.pow(Math.random(), 0.5)

    // Perfect sphere (no stretching)
    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    positions.push(x, y, z)
    randoms.push(Math.random())
  }

  return {
    positions: new Float32Array(positions),
    randoms: new Float32Array(randoms),
  }
}

// The Particle Face
const ParticleFace = ({ entered }: { entered: boolean }) => {
  const shaderRef = useRef<any>(null)
  const groupRef = useRef<THREE.Group>(null!)
  const explosionRef = useRef(0)
  const targetRotation = useRef({ x: 0, y: 0 })

  const { positions, randoms } = useMemo(() => generateHeadPoints(15000), [])

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uTime = state.clock.getElapsedTime()

      // Mouse follow - rotate head towards cursor
      targetRotation.current.y = state.pointer.x * 0.5
      targetRotation.current.x = -state.pointer.y * 0.3

      // Smooth rotation
      if (groupRef.current) {
        groupRef.current.rotation.y +=
          (targetRotation.current.y - groupRef.current.rotation.y) * 0.05
        groupRef.current.rotation.x +=
          (targetRotation.current.x - groupRef.current.rotation.x) * 0.05
      }

      // Explosion animation
      if (entered) {
        explosionRef.current = Math.min(explosionRef.current + delta * 0.8, 1)
      } else {
        explosionRef.current = Math.max(explosionRef.current - delta * 2, 0)
      }
      shaderRef.current.uExplosion = explosionRef.current
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
        </bufferGeometry>
        {/* @ts-ignore */}
        <faceShaderMaterial
          ref={shaderRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

// The Canvas Wrapper
export default function ParticleWaveCanvas({
  entered = false,
}: ParticleWaveProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        background: "#000",
      }}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ParticleFace entered={entered} />
      </Canvas>
    </div>
  )
}
