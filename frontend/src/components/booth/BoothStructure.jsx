import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { COLORS } from '@utils/boothConstants';

const metalProps = { color: COLORS.metalPole, metalness: 0.8, roughness: 0.3 };

const TableModel = ({ targetWidth = 2.0 }) => {
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/models/table.glb',
      (loaded) => setGltf(loaded),
      undefined,
      (err) => console.warn('Table GLB load error:', err)
    );
  }, []);

  const scene = useMemo(() => {
    if (!gltf) return null;
    const clone = gltf.scene.clone(true);
    const wrapper = new THREE.Group();
    wrapper.add(clone);

    // Rotate 90° so the wide side faces the camera
    clone.rotation.y = Math.PI / 2;
    wrapper.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(wrapper);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Scale so the widest horizontal dimension = targetWidth
    const maxHoriz = Math.max(size.x, size.z);
    const scale = targetWidth / maxHoriz;
    wrapper.scale.setScalar(scale);
    wrapper.updateMatrixWorld(true);

    // Position: bottom on the ground, centered in x and z
    const scaledBox = new THREE.Box3().setFromObject(wrapper);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);

    wrapper.position.set(
      -center.x,
      -scaledBox.min.y,
      -center.z
    );

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return wrapper;
  }, [gltf]);

  if (!scene) return null;
  return <primitive object={scene} />;
};

const BoothStructure = () => {
  return (
    <group>
      {/* === BACKDROP FRAME (metal poles + horizontal bars) === */}
      <mesh position={[-2.6, 1.2, -1.0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>
      <mesh position={[0, 1.2, -1.0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 2.4, 8]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>
      <mesh position={[2.6, 1.2, -1.0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>
      <mesh position={[0, 2.4, -1.0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 5.2, 8]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>

      {/* === BACKDROP PANEL === */}
      <mesh position={[0, 1.2, -0.98]} receiveShadow>
        <planeGeometry args={[5.2, 2.3]} />
        <meshStandardMaterial color={COLORS.backdrop} side={THREE.DoubleSide} />
      </mesh>

      {/* Banner at top */}
      <mesh position={[0, 2.2, -0.96]}>
        <planeGeometry args={[4.8, 0.35]} />
        <meshStandardMaterial color={COLORS.banner} />
      </mesh>

      {/* === T-SHIRT HANGING BAR === */}
      <mesh position={[1.55, 1.85, -0.92]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 2.5, 8]} />
        <meshStandardMaterial {...metalProps} />
      </mesh>

      {/* === TWO TABLES side by side === */}
      <group position={[-0.88, 0, 0.3]}>
        <TableModel targetWidth={2.0} />
      </group>
      <group position={[0.88, 0, 0.3]}>
        <TableModel targetWidth={2.0} />
      </group>

      {/* === SIDE PANELS === */}
      <mesh position={[-2.6, 0.9, -0.3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial color={COLORS.sidePanel} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[2.6, 0.9, -0.3]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial color={COLORS.sidePanel} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default BoothStructure;
