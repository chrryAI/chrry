// Type declarations for React Three Fiber JSX elements
import { Object3DNode, extend } from "@react-three/fiber"
import * as THREE from "three"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>
      points: Object3DNode<THREE.Points, typeof THREE.Points>
      bufferGeometry: Object3DNode<
        THREE.BufferGeometry,
        typeof THREE.BufferGeometry
      >
      bufferAttribute: Object3DNode<
        THREE.BufferAttribute,
        typeof THREE.BufferAttribute
      > & {
        attach?: string
        args?: [ArrayLike<number>, number]
      }
      faceShaderMaterial: any
    }
  }
}
