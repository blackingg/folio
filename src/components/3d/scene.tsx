"use client";

import * as THREE from "three";
import { useEffect, useRef, useState, FC, ReactNode } from "react";
import {
  Canvas,
  extend,
  useFrame,
  useThree,
  ThreeEvent,
} from "@react-three/fiber";
import {
  useCursor,
  MeshPortalMaterial,
  CameraControls,
  Gltf,
  Text,
  Preload,
} from "@react-three/drei";
import { useRoute, useLocation } from "wouter";
import { easing, geometry } from "maath";
import { ArrowLeft } from "lucide-react";

// Custom geometry extended via maath
extend({ RoundedPlaneGeometry: geometry.RoundedPlaneGeometry });

const REGULAR_FONT = "/font/inter_regular.ttf";
const MEDIUM_FONT = "/font/inter_medium.ttf";

interface FrameProps {
  id: string;
  name: string;
  author: string;
  bg?: string;
  width?: number;
  height?: number;
  children?: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

interface RigProps {
  position?: THREE.Vector3;
  focus?: THREE.Vector3;
}

interface PortalMaterial extends THREE.ShaderMaterial {
  blend: number;
}

const BackButton = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/item/:id");

  if (!params?.id) return null;

  return (
    <div className="absolute top-6 left-6 z-50">
      <button
        onClick={() => window.history.back()}
        className="group px-4 py-2 bg-background/50 hover:bg-background/80 backdrop-blur-xl border border-border text-foreground rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Gallery</span>
      </button>
    </div>
  );
};

export const Scene: FC = () => {
  return (
    <div className="w-full h-full relative group/canvas">
      <BackButton />
      <Canvas
        flat
        camera={{ fov: 15, position: [0, 0, 20] }}
        style={{ height: "100%", width: "100%" }}
        dpr={[1, 2]} // Better resolution for retina while keeping performance
        gl={{
          antialias: true,
          stencil: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Gallery />
        <Rig />
        <Preload all />
      </Canvas>
    </div>
  );
};

// Extracted Gallery component to support different scenes later
function Gallery() {
  return (
    <>
      <Frame
        id="01"
        name={`pick\nles`}
        author="Omar Faruq Tawsif"
        bg="#e4cdac"
        position={[-1.15, 0, 0]}
        rotation={[0, 0.5, 0]}
      >
        <Gltf
          src="/3d/pickles_3d_version_of_hyuna_lees_illustration-transformed.glb"
          scale={8}
          position={[0, -0.7, -2]}
        />
      </Frame>
      <Frame
        id="02"
        name="tea"
        author="Omar Faruq Tawsif"
        position={[0, 0, 0]}
      >
        <Gltf
          src="/3d/fiesta_tea-transformed.glb"
          position={[0, -2, -3]}
        />
      </Frame>
      <Frame
        id="03"
        name="still"
        author="Omar Faruq Tawsif"
        bg="#d1d1ca"
        position={[1.15, 0, 0]}
        rotation={[0, -0.5, 0]}
      >
        <Gltf
          src="/3d/still_life_based_on_heathers_artwork-transformed.glb"
          scale={2}
          position={[0, -0.8, -4]}
        />
      </Frame>
    </>
  );
}

function Frame({
  id,
  name,
  author,
  bg = "#ffffff",
  width = 1,
  height = 1.61803398875,
  children,
  ...props
}: FrameProps) {
  const portal = useRef<PortalMaterial>(null!);
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/item/:id");
  const [hovered, hover] = useState(false);

  useCursor(hovered);

  useFrame((_state, dt) => {
    if (portal.current) {
      easing.damp(portal.current, "blend", params?.id === id ? 1 : 0, 0.2, dt);
    }
  });

  return (
    <group {...props}>
      <Text
        font={MEDIUM_FONT}
        fontSize={0.3}
        anchorY="top"
        anchorX="left"
        lineHeight={0.8}
        position={[-0.375, 0.715, 0.01]}
      >
        {name}
      </Text>
      <Text
        font={REGULAR_FONT}
        fontSize={0.1}
        anchorX="right"
        position={[0.4, -0.659, 0.01]}
      >
        /{id}
      </Text>
      <Text
        font={REGULAR_FONT}
        fontSize={0.04}
        anchorX="right"
        position={[0.0, -0.677, 0.01]}
      >
        {author}
      </Text>
      <mesh
        name={id}
        onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          setLocation("/item/" + id);
        }}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        {/* @ts-ignore - Custom geometry defined via extend */}
        <roundedPlaneGeometry args={[width, height, 0.1]} />
        <MeshPortalMaterial
          ref={portal as any}
          side={THREE.FrontSide}
          blur={0}
          resolution={256}
        >
          <color
            attach="background"
            args={[bg]}
          />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
}

function Rig({
  position = new THREE.Vector3(0, 0, 2),
  focus = new THREE.Vector3(0, 0, 0),
}: RigProps) {
  const { controls, scene } = useThree();
  const [, params] = useRoute("/item/:id");

  useEffect(() => {
    const active = scene.getObjectByName(params?.id || "");
    if (active && active.parent && (controls as any)?.setLookAt) {
      const targetPos = new THREE.Vector3(0, 0, 1.5);
      const targetFocus = new THREE.Vector3(0, 0, -2);
      active.parent.localToWorld(targetPos);
      active.parent.localToWorld(targetFocus);

      (controls as any).setLookAt(
        targetPos.x,
        targetPos.y,
        targetPos.z,
        targetFocus.x,
        targetFocus.y,
        targetFocus.z,
        true
      );
    } else if (!params?.id && (controls as any)?.setLookAt) {
      (controls as any).setLookAt(0, 0, 20, 0, 0, 0, true);
    }
  }, [params, scene, controls]);

  return (
    <CameraControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

export default Scene;
