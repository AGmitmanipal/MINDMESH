"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

// 1. Interactive Warped Cyber Core Sphere
function CyberCoreSphere({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Continuous subtle organic rotation
    meshRef.current.rotation.x += delta * 0.25;
    meshRef.current.rotation.y += delta * 0.35;

    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.15;
      wireframeRef.current.rotation.y += delta * 0.2;
    }

    // Dynamic mouse parallax tilt
    if (mouse.current) {
      const targetX = mouse.current.x * 0.6;
      const targetY = mouse.current.y * 0.4;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.5}>
      <group>
        {/* Core Distorted Sphere */}
        <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.2}>
          <MeshDistortMaterial
            color="#7c3aed"
            emissive="#4c1d95"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.85}
            distort={0.42}
            speed={2.2}
          />
        </Sphere>

        {/* Outer Cyber Wireframe Shell */}
        <Sphere ref={wireframeRef} args={[1.9, 24, 24]}>
          <meshStandardMaterial
            color="#06b6d4"
            wireframe={true}
            transparent={true}
            opacity={0.25}
          />
        </Sphere>
      </group>
    </Float>
  );
}

// 2. Interactive Particle Galaxy System
function ParticleGalaxy({ count = 1800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorViolet = new THREE.Color("#8b5cf6");
    const colorCyan = new THREE.Color("#06b6d4");
    const colorWhite = new THREE.Color("#e0e7ff");

    for (let i = 0; i < count; i++) {
      // Cylindrical / spherical spread for galaxy feel
      const radius = 2.5 + Math.random() * 7.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Color distribution: mostly violet & cyan with white sparkles
      const choice = Math.random();
      const chosenColor = choice > 0.6 ? colorCyan : choice > 0.2 ? colorViolet : colorWhite;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3. Floating Network Nodes (Representing Distributed Systems & Agentic Graphs)
function FloatingNetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    return Array.from({ length: 18 }, () => ({
      pos: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
      ] as [number, number, number],
      size: 0.08 + Math.random() * 0.06,
    }));
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.pos}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#06b6d4" : "#a855f7"}
            emissive={i % 2 === 0 ? "#0891b2" : "#9333ea"}
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Fallback component if WebGL fails or client is loading
function CyberFallbackMesh() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-80 h-80 sm:w-96 sm:h-96">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-cyan-500/30 blur-3xl animate-pulse" />
        <div className="absolute inset-4 rounded-full border border-purple-500/30 animate-spin [animation-duration:20s]" />
        <div className="absolute inset-12 rounded-full border border-dashed border-cyan-400/40 animate-spin [animation-duration:15s] [animation-direction:reverse]" />
        <div className="absolute inset-20 rounded-full bg-purple-900/30 backdrop-blur-md border border-purple-400/30 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-cyan-400/20 blur-md animate-ping" />
        </div>
      </div>
    </div>
  );
}

export default function Hero3D() {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to -1 to +1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return <CyberFallbackMesh />;
  }

  if (hasError) {
    return <CyberFallbackMesh />;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* 3D Canvas */}
      <div className="w-full h-full relative pointer-events-auto">
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onError={() => setHasError(true)}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -5, -5]} intensity={2.5} color="#06b6d4" />
          <pointLight position={[5, -5, 5]} intensity={2.5} color="#8b5cf6" />
          <pointLight position={[0, 8, 2]} intensity={1.8} color="#c084fc" />

          {/* 3D Scene Elements */}
          <CyberCoreSphere mouse={mouse} />
          <ParticleGalaxy count={2200} />
          <FloatingNetworkNodes />
        </Canvas>
      </div>
    </div>
  );
}
