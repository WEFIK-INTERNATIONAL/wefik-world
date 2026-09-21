'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function TorusKnotObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.2, 0.35, 128, 32]} />
        <meshStandardMaterial
          color="#A3E635"
          emissive="#2A420E"
          wireframe
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function FloatingCardObject({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const cardRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (cardRef.current) {
      cardRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={cardRef} position={position} rotation={rotation}>
        <boxGeometry args={[1.5, 0.9, 0.04]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.6}
          opacity={0.85}
          transparent
          roughness={0.1}
          ior={1.4}
          thickness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3DScene() {
  const [ready, setReady] = useState(false);

  return (
    <div
      className={`relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#202124] via-[#152417] to-[#0A0D0B] border border-white/10 shadow-2xl transition-opacity duration-700 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background radial ambient lights */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-lime/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-deep-green/30 blur-3xl pointer-events-none" />

      <Canvas
        dpr={[1, 1.75]} // DPR capped at 1.75 per Section 5
        camera={{ position: [0, 0, 5], fov: 45 }}
        onCreated={() => {
          // Fades in after initial canvas paint per Section 5
          setReady(true);
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} color="#FFFFFF" />
        <pointLight position={[-4, -3, -2]} intensity={2} color="#A3E635" />

        {/* Central lime wireframe torus knot */}
        <TorusKnotObject />

        {/* Glassmorphic floating cards */}
        <FloatingCardObject position={[-2, 1.2, -1]} rotation={[0.2, 0.4, -0.1]} color="#4F741B" />
        <FloatingCardObject position={[2.2, -1.2, -0.5]} rotation={[-0.1, -0.3, 0.2]} color="#202124" />

        {/* Floating Brand Particle Field */}
        <Sparkles
          count={45}
          scale={7}
          size={2.5}
          speed={0.4}
          color="#A3E635"
          opacity={0.65}
        />
      </Canvas>

      {/* Overlay Badge */}
      <div className="absolute bottom-6 inset-x-6 flex items-center justify-between pointer-events-none text-xs">
        <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-slate-300 font-mono text-[11px] backdrop-blur-md">
          WebGL Active • 60 FPS
        </span>
        <span className="text-lime font-mono text-[11px] font-bold">
          Wefik 3D Engine
        </span>
      </div>
    </div>
  );
}
