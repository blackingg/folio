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
  "#a41623",
  "#f85e00",
  "#33673b",
  "#8eb8e5",
  "#ca9ce1",
  "#c6c013",
];

function MainSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const handleClick = () => {
    // Get new shape index (different from current)
    let newShapeIndex = Math.floor(Math.random() * SHAPES.length);
    while (newShapeIndex === shapeIndex && SHAPES.length > 1) {
      newShapeIndex = Math.floor(Math.random() * SHAPES.length);
    }

    // Get new color index (different from current)
    let newColorIndex = Math.floor(Math.random() * COLORS.length);
    while (newColorIndex === colorIndex && COLORS.length > 1) {
      newColorIndex = Math.floor(Math.random() * COLORS.length);
    }

    setShapeIndex(newShapeIndex);
    setColorIndex(newColorIndex);
  };

  const currentColor = COLORS[colorIndex];

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
        {SHAPES[shapeIndex] === "torus_knot" && (
          <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />
        )}
        {SHAPES[shapeIndex] === "sphere" && (
          <sphereGeometry args={[1, 32, 32]} />
        )}
        {SHAPES[shapeIndex] === "icosahedron" && (
          <icosahedronGeometry args={[1, 0]} />
        )}
        {SHAPES[shapeIndex] === "octahedron" && (
          <octahedronGeometry args={[1, 0]} />
        )}
        {SHAPES[shapeIndex] === "dodecahedron" && (
          <dodecahedronGeometry args={[1, 0]} />
        )}
        {SHAPES[shapeIndex] === "torus" && (
          <torusGeometry args={[0.8, 0.3, 16, 100]} />
        )}

        <MeshDistortMaterial
          color={currentColor}
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="aspect-video w-full rounded-xl border bg-black shadow-xl overflow-hidden relative">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 8]}
        />

        <ambientLight intensity={1.2} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          color="#ffffff"
        />

        <directionalLight
          position={[-5, -5, -5]}
          intensity={0.8}
          color="#ffffff"
        />

        <pointLight
          position={[10, 10, 10]}
          intensity={50}
          color="#ffffff"
          decay={2}
        />

        <pointLight
          position={[-10, -10, 5]}
          intensity={30}
          color="#f0f9ff"
          decay={2}
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
