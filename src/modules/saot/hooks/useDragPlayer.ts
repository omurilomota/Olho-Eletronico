import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import type { Position } from '../store/useSaotStore';

export function useDragPlayer(onUpdate: (pos: Position) => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const handleDrag = useCallback(
    (localMatrix: THREE.Matrix4) => {
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(localMatrix);
      onUpdateRef.current({ x: pos.x, z: pos.z });
    },
    [],
  );
  return handleDrag;
}
