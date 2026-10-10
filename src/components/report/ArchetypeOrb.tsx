"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import type { OrbShape } from "@/lib/report/themes";

type Props = { shape: OrbShape; color: string; color2: string; /** Stop rendering (e.g. while faded out). */ paused?: boolean };

// Each archetype gets its own live 3D object until (and alongside) the generated imagery.
function Shape({ shape, color, color2, small }: Props & { small?: boolean }) {
  const glossy = { color, roughness: 0.18, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.15 };

  switch (shape) {
    case "petal": // Innocent — soft breathing pearl
      return (
        <mesh>
          <sphereGeometry args={[1.25, 64, 64]} />
          <MeshDistortMaterial color={color} roughness={0.25} metalness={0.05} distort={0.28} speed={1.4} />
        </mesh>
      );
    case "crystal": // Magician — faceted prism
      return (
        <>
          <mesh rotation={[0.4, 0.2, 0]}>
            <octahedronGeometry args={[1.35, 0]} />
            {/* No transmission: it needs an extra render pass every frame. Iridescent clearcoat reads as crystal. */}
            <meshPhysicalMaterial color={color} roughness={0.08} metalness={0.25} transparent opacity={0.88} iridescence={1} iridescenceIOR={1.4} clearcoat={1} clearcoatRoughness={0.05} />
          </mesh>
          <Sparkles count={small ? 18 : 40} scale={4} size={3} speed={0.4} color={color2} />
        </>
      );
    case "crown": // Ruler — golden ring around a pearl
      return (
        <>
          <mesh rotation={[1.2, 0, 0]}>
            <torusGeometry args={[1.25, 0.16, 48, 160]} />
            <meshStandardMaterial color={color} metalness={1} roughness={0.22} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.62, 64, 64]} />
            <meshPhysicalMaterial color={color2} roughness={0.25} clearcoat={1} sheen={1} />
          </mesh>
        </>
      );
    case "spike": // Rebel — sharp, restless form
      return (
        <mesh>
          <icosahedronGeometry args={[1.3, 0]} />
          <MeshDistortMaterial color={color} roughness={0.3} metalness={0.4} distort={0.45} speed={3.5} flatShading />
        </mesh>
      );
    case "knot": // Creator — sculpted swirl
      return (
        <mesh>
          <torusKnotGeometry args={[0.85, 0.3, 220, 32, 2, 3]} />
          <meshPhysicalMaterial {...glossy} />
        </mesh>
      );
    case "bubbles": // Jester — bouncing candy spheres
      return (
        <>
          {[
            [-0.8, 0.4, 0, 0.7, color],
            [0.75, -0.2, 0.3, 0.55, color2],
            [0.1, -0.85, -0.2, 0.42, color],
            [0.45, 0.9, -0.4, 0.32, color2],
          ].map(([x, y, z, r, c], i) => (
            <Float key={i} speed={3 + i} floatIntensity={2} rotationIntensity={0}>
              <mesh position={[x as number, y as number, z as number]}>
                <sphereGeometry args={[r as number, 64, 64]} />
                <meshPhysicalMaterial color={c as string} roughness={0.12} clearcoat={1} />
              </mesh>
            </Float>
          ))}
        </>
      );
    case "shield": // Hero — bronze dodecahedron
      return (
        <mesh>
          <dodecahedronGeometry args={[1.25, 0]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.28} flatShading />
        </mesh>
      );
    case "cube": // Everyman — friendly rounded block
      return (
        <RoundedBox args={[1.7, 1.7, 1.7]} radius={0.35} smoothness={6}>
          <meshPhysicalMaterial {...glossy} />
        </RoundedBox>
      );
    case "nest": // Caregiver — sphere held by a ring
      return (
        <>
          <mesh>
            <sphereGeometry args={[0.8, 64, 64]} />
            <meshPhysicalMaterial color={color2} roughness={0.3} clearcoat={1} />
          </mesh>
          <mesh rotation={[1.4, 0.3, 0]}>
            <torusGeometry args={[1.25, 0.28, 48, 120]} />
            <meshPhysicalMaterial {...glossy} />
          </mesh>
        </>
      );
    case "gyro": // Explorer — compass rings
      return (
        <>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[i * 0.9, i * 0.6, 0]}>
              <torusGeometry args={[1.25 - i * 0.22, 0.05, 24, 140]} />
              <meshStandardMaterial color={i === 1 ? color2 : color} metalness={0.95} roughness={0.2} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.32, 48, 48]} />
            <meshPhysicalMaterial color={color2} roughness={0.1} clearcoat={1} />
          </mesh>
        </>
      );
    case "drop": // Sage — calm glass drop
      return (
        <mesh scale={[1, 1.2, 1]}>
          <sphereGeometry args={[1.1, 64, 64]} />
          <meshPhysicalMaterial color={color} roughness={0.1} metalness={0.1} transparent opacity={0.9} clearcoat={1} clearcoatRoughness={0.05} sheen={0.6} />
        </mesh>
      );
    case "heart": // Lover — pulsing velvet sphere pair
    default:
      return (
        <mesh>
          <sphereGeometry args={[1.2, 64, 64]} />
          <MeshDistortMaterial color={color} roughness={0.35} metalness={0.05} distort={0.4} speed={2} />
        </mesh>
      );
  }
}

export default function ArchetypeOrb(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  // This component only renders in the browser (loaded with ssr: false), so window is available here.
  const [env] = useState(() => ({
    small: window.matchMedia("(max-width: 767px)").matches,
    still: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));

  useEffect(() => {
    // Stop rendering while off-screen so scrolling stays smooth, especially on phones.
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "120px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="size-full">
      <Canvas
        frameloop={visible && !props.paused && !env.still ? "always" : "demand"}
        // Measure layout size, not the transformed box: the wrapper is scaled by GSAP.
        resize={{ offsetSize: true }}
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: !env.small, powerPreference: "high-performance" }}
      >
        <OrbScene {...props} small={env.small} />
      </Canvas>
    </div>
  );
}

function OrbScene(props: Props & { small: boolean }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <Float speed={1.4} rotationIntensity={0.9} floatIntensity={1.1}>
        <Shape {...props} />
      </Float>
      {/* Procedural studio lighting — no HDR download needed */}
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 4, -6]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color={props.color2} />
        <Lightformer intensity={1.2} position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#fff4ec" />
      </Environment>
    </>
  );
}
