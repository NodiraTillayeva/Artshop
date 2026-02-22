import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useBoothState, useBoothDispatch } from '@hooks/useBoothStore';
import { COLORS, SECTIONS, STICKER_SHEET_POSITIONS } from '@utils/boothConstants';
import BoothStructure from './BoothStructure';
import PrintsWall from './PrintsWall';
import KeychainRack from './KeychainRack';
import StickerRack from './StickerRack';
import StickerSheet from './StickerSheet';
import TShirtDisplay from './TShirtDisplay';

const CameraAnimator = () => {
  const controlsRef = useRef();
  const { activeSection } = useBoothState();
  const targetVec = useRef(new THREE.Vector3(0, 1.0, 0));
  const prevSection = useRef(activeSection);
  const animatingDist = useRef(false);

  // Only animate distance when the section changes
  if (prevSection.current !== activeSection) {
    prevSection.current = activeSection;
    animatingDist.current = true;
  }

  useFrame((state) => {
    if (!controlsRef.current) return;

    const section = SECTIONS[activeSection] || SECTIONS.overview;
    const [tx, ty, tz] = section.target;

    // Lerp target position
    targetVec.current.lerp(new THREE.Vector3(tx, ty, tz), 0.04);
    controlsRef.current.target.copy(targetVec.current);

    // Lerp camera distance only during section transitions
    if (animatingDist.current) {
      const currentDist = state.camera.position.distanceTo(targetVec.current);
      const wantedDist = section.distance;
      if (Math.abs(currentDist - wantedDist) > 0.05) {
        const dir = state.camera.position.clone().sub(targetVec.current).normalize();
        const newDist = THREE.MathUtils.lerp(currentDist, wantedDist, 0.04);
        state.camera.position.copy(
          targetVec.current.clone().add(dir.multiplyScalar(newDist))
        );
      } else {
        animatingDist.current = false;
      }
    }

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 1.0, 0]}
      enablePan={false}
      minDistance={0.5}
      maxDistance={5}
      minPolarAngle={Math.PI / 2.8}
      maxPolarAngle={Math.PI / 2.2}
      minAzimuthAngle={-Math.PI / 3}
      maxAzimuthAngle={Math.PI / 3}
    />
  );
};

const BoothScene = () => {
  const { selectedItem, stickerSheets } = useBoothState();
  const dispatch = useBoothDispatch();

  const handlePointerMissed = () => {
    if (selectedItem) {
      dispatch({ type: 'DESELECT_ITEM' });
    }
  };

  return (
    <>
      {/* Fog + background */}
      <fog attach="fog" args={['#2a2a3a', 5, 14]} />
      <color attach="background" args={['#2a2a3a']} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={4}
        shadow-camera-bottom={-2}
      />
      <pointLight position={[-3, 3, 2]} intensity={0.6} color="#fff5e6" />
      <pointLight position={[3, 3, 2]} intensity={0.4} color="#fff5e6" />
      <spotLight
        position={[-1.3, 4, 1]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.8}
        castShadow={false}
      />
      <spotLight
        position={[1.3, 4, 1]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.8}
        castShadow={false}
      />

      <Environment preset="city" background={false} />

      {/* Camera with section animation */}
      <CameraAnimator />

      {/* Ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onClick={handlePointerMissed}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={COLORS.ground} />
      </mesh>

      {/* Booth structure */}
      <BoothStructure />

      {/* 4 sections */}
      <PrintsWall />
      <KeychainRack />
      <StickerRack />
      {stickerSheets.map((sheet, i) => {
        const pos = STICKER_SHEET_POSITIONS[i];
        if (!pos) return null;
        return <StickerSheet key={sheet.id} sheet={sheet} position={pos} index={i} />;
      })}
      <TShirtDisplay />
    </>
  );
};

export default BoothScene;
