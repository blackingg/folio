"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import {
  OrbitControls,
  Float,
  MeshDistortMaterial,
  Stars,
  PerspectiveCamera,
} from "@react-three/drei";

const SHAPES = [
  "torus_knot",
  "sphere",
  "icosahedron",
  "octahedron",
  "dodecahedron",
  "torus",
];
const COLORS = [
  "#4f46e5",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
  "#8b5cf6",
];

function MainSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [index, setIndex] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const handleClick = () => {
    let newIndex = Math.floor(Math.random() * SHAPES.length);
    while (newIndex === index && SHAPES.length > 1) {
      newIndex = Math.floor(Math.random() * SHAPES.length);
    }
    setIndex(newIndex);
  };

  const currentColor = COLORS[index % COLORS.length];

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
        onClick={handleClick}
        scale={2}
      >
        {SHAPES[index] === "torus_knot" && (
          <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />
        )}
        {SHAPES[index] === "sphere" && <sphereGeometry args={[1, 32, 32]} />}
        {SHAPES[index] === "icosahedron" && (
          <icosahedronGeometry args={[1, 0]} />
        )}
        {SHAPES[index] === "octahedron" && <octahedronGeometry args={[1, 0]} />}
        {SHAPES[index] === "dodecahedron" && (
          <dodecahedronGeometry args={[1, 0]} />
        )}
        {SHAPES[index] === "torus" && (
          <torusGeometry args={[0.8, 0.3, 16, 100]} />
        )}

        <MeshDistortMaterial
          color={currentColor}
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export function Scene() {
  return (
    <div className="aspect-video w-full rounded-xl border bg-black shadow-xl overflow-hidden relative">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 8]}
        />
        
        <ambientLight intensity={0.3} />
        
        <directionalLight
          position={[-5, 3, -5]}
          intensity={0.08}
          color="#a5b4fc"
        />
        
        <pointLight
          position={[-10, -8, -5]}
          intensity={10}
          color="#fbbf24"
          decay={0}
        />
        
        <pointLight
          position={[0, 10, 0]}
          intensity={0.5}
          color="#ec4899"
          decay={0}
        />

        <group>
          <MainSphere />
        </group>

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}