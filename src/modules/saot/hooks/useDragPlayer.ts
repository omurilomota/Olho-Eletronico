import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import type { Position } from '../store/useSaotStore';

const _vec = new THREE.Vector3();

export function useDragPlayer(onUpdate: (pos: Position) => void) {
  const ref = useRef(onUpdate);
  ref.current = onUpdate;

  const handleDrag = useCallback(
    (localMatrix: THREE.Matrix4) => {
      _vec.setFromMatrixPosition(localMatrix);
      ref.current({ x: _vec.x, z: _vec.z });
    },
    [],
  );
  return handleDrag;
}
