import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export type CameraPreset = 'broadcast' | 'tactical' | 'goal-left' | 'goal-right' | 'free';

interface CameraControllerProps {
  preset: CameraPreset;
  followBall?: boolean;
  ballPosition?: [number, number, number];
}

const PRESETS: Record<CameraPreset, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  broadcast: {
    position: new THREE.Vector3(0, 12, 18),
    target: new THREE.Vector3(0, 0, 0),
  },
  tactical: {
    position: new THREE.Vector3(0, 25, 0.1),
    target: new THREE.Vector3(0, 0, 0),
  },
  'goal-left': {
    position: new THREE.Vector3(-14, 3, 0),
    target: new THREE.Vector3(0, 1, 0),
  },
  'goal-right': {
    position: new THREE.Vector3(14, 3, 0),
    target: new THREE.Vector3(0, 1, 0),
  },
  free: {
    position: new THREE.Vector3(0, 12, 18),
    target: new THREE.Vector3(0, 0, 0),
  },
};

export default function CameraController({ preset, followBall = false, ballPosition }: CameraControllerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (preset === 'free') {
      isAnimating.current = false;
      return;
    }

    const presetData = PRESETS[preset];
    targetPos.current.copy(presetData.position);
    targetLookAt.current.copy(presetData.target);
    isAnimating.current = true;
  }, [preset]);

  useFrame(() => {
    if (!isAnimating.current || preset === 'free') return;

    camera.position.lerp(targetPos.current, 0.03);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);
      controlsRef.current.update();
    }

    if (camera.position.distanceTo(targetPos.current) < 0.1) {
      isAnimating.current = false;
    }
  });

  useEffect(() => {
    if (followBall && ballPosition && controlsRef.current) {
      targetLookAt.current.set(ballPosition[0], 1, ballPosition[2]);
      isAnimating.current = true;
    }
  }, [followBall, ballPosition]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      minDistance={5}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={0.1}
    />
  );
}
