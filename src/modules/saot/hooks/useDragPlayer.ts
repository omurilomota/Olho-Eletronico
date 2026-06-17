import { useCallback } from 'react';
import * as THREE from 'three';
import type { Position } from '../store/useSaotStore';

export function useDragPlayer(onUpdate: (pos: Position) => void) {
  const handleDrag = useCallback(
    (localMatrix: THREE.Matrix4) => {
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(localMatrix);
      onUpdate({ x: pos.x, z: pos.z });
    },
    [onUpdate],
  );
  return handleDrag;
}
