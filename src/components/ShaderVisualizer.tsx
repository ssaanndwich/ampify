'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

interface ShaderVisualizerProps {
  fragmentShader: string;
  vertexShader: string;
  analyserNode: AnalyserNode | null;
}

const ShaderMaterial = ({ 
  fragmentShader, 
  vertexShader, 
  analyserNode 
}: ShaderVisualizerProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [time, setTime] = useState(0);

  
  // Update local shader state when props change
  useEffect(() => {
    console.log('[ShaderVisualizer] Shader props changed, updating material');
    
    // Update material shader if it exists
    if (materialRef.current) {
      materialRef.current.fragmentShader = fragmentShader;
      materialRef.current.vertexShader = vertexShader;
      materialRef.current.needsUpdate = true;
      console.log('[ShaderVisualizer] Material updated');
    }
  }, [fragmentShader, vertexShader]);
  
  useEffect(() => {
    if (analyserNode) {
      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      setAudioData(dataArray);
    }
  }, [analyserNode]);

  // Create uniform textures once
  const audioTexture = useMemo(() => {
    const texture = new THREE.DataTexture(
      new Uint8Array(128).fill(0),
      128,
      1,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Update shader uniforms on each frame
  useFrame((_, delta) => {
    if (materialRef.current) {
      setTime(prevTime => prevTime + delta);
      
      if (analyserNode && audioData) {
        analyserNode.getByteFrequencyData(audioData);
        audioTexture.image.data = audioData;
        audioTexture.needsUpdate = true;
        
        materialRef.current.uniforms.audioData.value = audioTexture;
        materialRef.current.uniforms.time.value = time;
      }
    }
  });

  // Prepare uniforms
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      audioData: { value: audioTexture },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    }),
    [audioTexture]
  );

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        key={`${fragmentShader.length}-${vertexShader.length}`}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const ShaderVisualizer = ({ 
  fragmentShader, 
  vertexShader, 
  analyserNode 
}: ShaderVisualizerProps) => {
  // Add a counter for shader changes to force remount of Canvas
  const [shaderCounter, setShaderCounter] = useState(0);
  
  // Force a remount when shaders change to ensure Three.js updates correctly
  useEffect(() => {
    setShaderCounter(prev => prev + 1);
    console.log('[ShaderVisualizer] Detected shader change, forcing remount');
  }, [fragmentShader, vertexShader]);
  
  return (
    <div className="w-full h-full">
      <Canvas key={`canvas-${shaderCounter}`}>
        <ShaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          analyserNode={analyserNode}
        />
      </Canvas>
    </div>
  );
};

export default ShaderVisualizer; 