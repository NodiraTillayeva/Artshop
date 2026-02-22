import { useState, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useBoothState } from '@hooks/useBoothStore';
import { STICKER_POSITIONS } from '@utils/boothConstants';
import Sticker from './Sticker';

/**
 * Detect upward-facing shelf surfaces via raycasting.
 * Casts rays downward at a grid of z-positions and returns
 * distinct shelf levels sorted bottom-to-top:
 *   [{ y: shelfSurfaceY, zFront: frontEdgeZ }, ...]
 */
function detectShelves(wrapper, meshes) {
  const raycaster = new THREE.Raycaster();
  const hits = []; // { y, z }

  // Probe along the center (x=0) at many z depths
  for (let z = -0.30; z <= 0.32; z += 0.02) {
    raycaster.set(
      new THREE.Vector3(0, 0.6, z),
      new THREE.Vector3(0, -1, 0)
    );
    const results = raycaster.intersectObjects(meshes, true);
    for (const hit of results) {
      if (!hit.face) continue;
      // Transform face normal to wrapper-local space
      const normal = hit.face.normal.clone();
      normal.transformDirection(hit.object.matrixWorld);
      // Upward-facing surface = shelf
      if (normal.y > 0.7) {
        hits.push({ y: hit.point.y, z });
      }
    }
  }

  if (hits.length === 0) return [];

  // Cluster nearby y-values into distinct shelf levels (tolerance 0.03)
  hits.sort((a, b) => a.y - b.y);
  const shelves = [];
  let cluster = [hits[0]];

  for (let i = 1; i < hits.length; i++) {
    if (hits[i].y - cluster[cluster.length - 1].y < 0.03) {
      cluster.push(hits[i]);
    } else {
      shelves.push(cluster);
      cluster = [hits[i]];
    }
  }
  shelves.push(cluster);

  // For each cluster, compute average y, front z, and back z
  return shelves.map((pts) => ({
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    zFront: Math.max(...pts.map((p) => p.z)),
    zBack: Math.min(...pts.map((p) => p.z)),
  }));
}

const DisplayStand = ({ onShelvesDetected }) => {
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/display_stand.glb',
      (loaded) => setGltf(loaded),
      undefined,
      (err) => console.warn('Display stand GLB load error:', err)
    );
  }, []);

  const scene = useMemo(() => {
    if (!gltf) return null;
    const clone = gltf.scene.clone(true);
    const wrapper = new THREE.Group();
    wrapper.add(clone);

    // Rotate 180° so the front faces the camera
    clone.rotation.y = Math.PI;
    wrapper.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(wrapper);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Scale stand to 0.65 tall
    const heightDim = Math.max(size.y, size.z);
    const targetHeight = 0.65;
    const scale = targetHeight / heightDim;
    wrapper.scale.setScalar(scale);
    wrapper.updateMatrixWorld(true);

    // Position: bottom at y=0, centered in x and z
    const scaledBox = new THREE.Box3().setFromObject(wrapper);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);

    wrapper.position.set(-center.x, -scaledBox.min.y, -center.z);
    wrapper.updateMatrixWorld(true);

    const meshes = [];
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mat = child.material.clone();
          mat.polygonOffset = true;
          mat.polygonOffsetFactor = 1;
          mat.polygonOffsetUnits = 1;
          mat.side = THREE.FrontSide;
          child.material = mat;
        }
        meshes.push(child);
      }
    });

    // Detect shelf surfaces from actual geometry
    const shelves = detectShelves(wrapper, meshes);

    // Measure stand width from final bounding box
    const finalBox = new THREE.Box3().setFromObject(wrapper);
    const standWidth = finalBox.max.x - finalBox.min.x;

    if (onShelvesDetected) onShelvesDetected({ shelves, width: standWidth });

    return wrapper;
  }, [gltf, onShelvesDetected]);

  if (!scene) return null;
  return <primitive object={scene} />;
};

const BOTTOM_COUNT = 5;
const SECOND_COUNT = 5;
const X_MARGIN_RATIO = 0.15;       // 15% margin on each side of stand
const BOTTOM_Z_INSET_RATIO = 0.30; // bottom tier: moderate depth
const SECOND_Z_INSET_RATIO = 0.40; // upper tier: slightly deeper
const SHELF_PAD = 0.015;           // min clearance from shelf walls
const STACK_DEPTH_RATIO = 0.09;    // matches STACK_SPACING_RATIO in Sticker
const MAX_STACK = 6;               // matches MAX_VISIBLE_STACK in Sticker

const StickerRack = () => {
  const { stickers } = useBoothState();
  const [shelfData, setShelfData] = useState(null);

  const handleShelves = useCallback((data) => setShelfData(data), []);

  // Derive all positions and sizing from detected shelf geometry
  const { positions, cellSize } = useMemo(() => {
    if (!shelfData?.shelves || shelfData.shelves.length < 2) {
      return { positions: STICKER_POSITIONS, cellSize: 0.13 };
    }

    const { shelves, width } = shelfData;
    const bottom = shelves[0];
    const second = shelves[1];

    // X layout: distribute evenly within usable width
    const margin = width * X_MARGIN_RATIO;
    const usableWidth = width - 2 * margin;
    const xStep = usableWidth / (BOTTOM_COUNT - 1);
    const computedCellSize = xStep * 0.9;

    // Z layout: each tier has its own inset, clamped to shelf bounds
    const maxStackExtent = (MAX_STACK - 1) * computedCellSize * STACK_DEPTH_RATIO;
    const clampZ = (z, shelf) => {
      const minZ = shelf.zBack + SHELF_PAD;
      const maxZ = shelf.zFront - SHELF_PAD - maxStackExtent;
      return Math.max(minZ, Math.min(maxZ, z));
    };

    const bottomDepth = bottom.zFront - bottom.zBack;
    const secondDepth = second.zFront - second.zBack;
    const bottomZ = clampZ(bottom.zFront - bottomDepth * BOTTOM_Z_INSET_RATIO, bottom);
    const secondZ = clampZ(second.zFront - secondDepth * SECOND_Z_INSET_RATIO, second);

    const pos = [];

    // Bottom shelf — centered row of BOTTOM_COUNT
    const bottomXStart = -((BOTTOM_COUNT - 1) / 2) * xStep;
    for (let i = 0; i < BOTTOM_COUNT; i++) {
      pos.push([bottomXStart + i * xStep, bottom.y, bottomZ]);
    }

    // Second shelf — centered row of SECOND_COUNT (same xStep)
    const secondXStart = -((SECOND_COUNT - 1) / 2) * xStep;
    for (let i = 0; i < SECOND_COUNT; i++) {
      pos.push([secondXStart + i * xStep, second.y, secondZ]);
    }

    return { positions: pos, cellSize: computedCellSize };
  }, [shelfData]);

  return (
    <group position={[0.88, 0.72, 0.15]}>
      <DisplayStand onShelvesDetected={handleShelves} />

      {stickers.map((s, index) => {
        const pos = positions[index];
        if (!pos) return null;
        return <Sticker key={s.id} sticker={s} position={pos} cellSize={cellSize} />;
      })}

    </group>
  );
};

export default StickerRack;
