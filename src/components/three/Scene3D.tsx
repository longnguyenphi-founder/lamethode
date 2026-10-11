"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls } from "@react-three/drei";

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
      <ambientLight intensity={1.4} color="#fff1ea" />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-4, -2, -3]} intensity={25} color="#f0bfac" />

      <Float speed={1.6} rotationIntensity={0.8} floatIntensity={1.4}>
        <mesh>
          <icosahedronGeometry args={[1.3, 64]} />
          <MeshDistortMaterial
            color="#eab09c"
            metalness={0.2}
            roughness={0.28}
            distort={0.35}
            speed={2}
          />
        </mesh>
      </Float>

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
