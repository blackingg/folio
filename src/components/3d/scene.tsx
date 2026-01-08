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
import { easing, geometry } from "maath";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

interface RigProps {
  position?: THREE.Vector3;
  focus?: THREE.Vector3;
  activeId: string | null;
}

interface PortalMaterial extends THREE.ShaderMaterial {
  blend: number;
}

const BackButton = ({
  setActiveId,
  activeId,
}: {
  setActiveId: (id: string | null) => void;
  activeId: string | null;
}) => {
  if (!activeId) return null;

  return (
    <div className="absolute top-6 left-6 z-50">
      <button
        onClick={() => setActiveId(null)}
        className="group px-4 py-2 bg-background/50 hover:bg-background/80 backdrop-blur-xl border border-border text-foreground rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Gallery</span>
      </button>
    </div>
  );
};

export const Scene: FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <motion.div
      initial={false}
      animate={
        activeId
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 100,
              backgroundColor: "hsl(var(--background))",
            }
          : {
              position: "relative",
              width: "100%",
              height: "100%",
            }
      }
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="group/canvas"
    >
      <BackButton
        activeId={activeId}
        setActiveId={setActiveId}
      />
      <Canvas
        flat
        camera={{ fov: 15, position: [0, 0, 20] }}
        style={{ height: "100%", width: "100%" }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          stencil: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Gallery
          activeId={activeId}
          setActiveId={setActiveId}
        />
        <Rig activeId={activeId} />
        <Preload all />
      </Canvas>
    </motion.div>
  );
};

function Gallery({
  activeId,
  setActiveId,
}: {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  return (
    <>
      <Frame
        id="01"
        name={`pick\nles`}
        author="Omar Faruq Tawsif"
        bg="#e4cdac"
        position={[-1.15, 0, 0]}
        rotation={[0, 0.5, 0]}
        activeId={activeId}
        setActiveId={setActiveId}
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
        activeId={activeId}
        setActiveId={setActiveId}
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
        activeId={activeId}
        setActiveId={setActiveId}
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
  activeId,
  setActiveId,
  ...props
}: FrameProps) {
  const portal = useRef<PortalMaterial>(null!);
  const [hovered, hover] = useState(false);

  useCursor(hovered);

  useFrame((_state, dt) => {
    if (portal.current) {
      easing.damp(portal.current, "blend", activeId === id ? 1 : 0, 0.2, dt);
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
          setActiveId(activeId === id ? null : id);
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
          resolution={activeId === id ? 1024 : 256}
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
  activeId,
}: RigProps) {
  const { controls, scene } = useThree();

  useEffect(() => {
    const active = scene.getObjectByName(activeId || "");
    if (active && active.parent && (controls as any)?.setLookAt) {
      const targetPos = new THREE.Vector3(0, 0, 2.0);
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
    } else if (!activeId && (controls as any)?.setLookAt) {
      (controls as any).setLookAt(0, 0, 20, 0, 0, 0, true);
    }
  }, [activeId, scene, controls]);

  return (
    <CameraControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

export default Scene;
