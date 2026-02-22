import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useBoothDispatch, useBoothState } from '@hooks/useBoothStore';

const SHEET_MAX_DIM = 0.25;
const SHEET_THICKNESS = 0.002;
const Y_ROTATIONS = [0.08, -0.05, 0.12, -0.1];

const StickerSheet = ({ sheet, position, index = 0 }) => {
  const groupRef = useRef();
  const dispatch = useBoothDispatch();
  const { selectedItem } = useBoothState();
  const [hovered, setHovered] = useState(false);
  const [pickedUp, setPickedUp] = useState(false);
  const [aspect, setAspect] = useState(1.5);
  const { camera } = useThree();

  const isSelected = selectedItem?.id === sheet.id;
  const yRot = Y_ROTATIONS[index % Y_ROTATIONS.length];

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(sheet.dataUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [sheet.dataUrl]);

  // Load actual image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.width && img.height) {
        setAspect(img.width / img.height);
      }
    };
    img.src = sheet.dataUrl;
  }, [sheet.dataUrl]);

  // Size preserving actual aspect ratio
  const sheetW = aspect >= 1 ? SHEET_MAX_DIM : SHEET_MAX_DIM * aspect;
  const sheetD = aspect >= 1 ? SHEET_MAX_DIM / aspect : SHEET_MAX_DIM;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      setPickedUp((p) => !p);
    } else {
      dispatch({
        type: 'SELECT_ITEM',
        payload: { type: 'stickerSheet', id: sheet.id },
      });
    }
  };

  useFrame(() => {
    if (!groupRef.current) return;
    if (pickedUp) {
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const worldPos = camera.position.clone().add(dir.multiplyScalar(0.4));
      const localPos = groupRef.current.parent.worldToLocal(worldPos.clone());
      groupRef.current.position.copy(localPos);
      groupRef.current.quaternion.copy(camera.quaternion);
      groupRef.current.rotateX(Math.PI / 2);
      groupRef.current.scale.setScalar(2.0);
    } else {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.set(0, yRot, 0);
      groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, yRot, 0]}>
      {/* Sheet body — flat box lying on table (hidden when picked up) */}
      <mesh
        visible={!pickedUp}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[sheetW, SHEET_THICKNESS, sheetD]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : '#f5f5f5'}
          roughness={0.4}
          metalness={0.0}
        />
      </mesh>

      {/* Top face — textured image (clickable when picked up) */}
      <mesh
        position={pickedUp ? [0, 0, 0] : [0, SHEET_THICKNESS / 2 + 0.0005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleClick}
        onPointerOver={pickedUp ? (e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        } : undefined}
        onPointerOut={pickedUp ? () => {
          setHovered(false);
          document.body.style.cursor = 'default';
        } : undefined}
      >
        <planeGeometry args={[sheetW, sheetD]} />
        <meshBasicMaterial
          map={texture}
          transparent={!pickedUp}
          depthWrite={pickedUp}
          side={THREE.DoubleSide}
          polygonOffset={!pickedUp}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {isSelected && !pickedUp && (
        <mesh position={[0, -0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[sheetW + 0.02, sheetD + 0.02]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
};

export default StickerSheet;
