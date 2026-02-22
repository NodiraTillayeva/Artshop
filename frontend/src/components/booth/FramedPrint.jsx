import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { useBoothDispatch, useBoothState } from '@hooks/useBoothStore';
import { COLORS } from '@utils/boothConstants';

const FramedPrint = ({ print, position }) => {
  const dispatch = useBoothDispatch();
  const { selectedItem } = useBoothState();
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const isSelected = selectedItem?.id === print.id;

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(print.dataUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [print.dataUrl]);

  // Compute dimensions preserving aspect ratio
  const aspect = print.width / print.height;
  const printHeight = 0.55;
  const printWidth = printHeight * aspect;
  const clampedWidth = Math.min(printWidth, 0.7);
  const finalWidth = clampedWidth;
  const finalHeight = clampedWidth / aspect;
  const frameThickness = 0.025;
  const frameDepth = 0.02;

  const frameColor = hovered ? COLORS.frameHover : COLORS.frameDefault;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      setFlipped((f) => !f);
    } else {
      dispatch({
        type: 'SELECT_ITEM',
        payload: { type: 'print', id: print.id },
      });
    }
  };

  return (
    <group
      position={position}
      rotation={[0, flipped ? Math.PI : 0, 0]}
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
    >
      {/* Frame — 4 bars */}
      {/* Top */}
      <mesh
        position={[0, finalHeight / 2 + frameThickness / 2, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            finalWidth + frameThickness * 2,
            frameThickness,
            frameDepth,
          ]}
        />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      {/* Bottom */}
      <mesh
        position={[0, -finalHeight / 2 - frameThickness / 2, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            finalWidth + frameThickness * 2,
            frameThickness,
            frameDepth,
          ]}
        />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      {/* Left */}
      <mesh
        position={[-finalWidth / 2 - frameThickness / 2, 0, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            frameThickness,
            finalHeight + frameThickness * 2,
            frameDepth,
          ]}
        />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      {/* Right */}
      <mesh
        position={[finalWidth / 2 + frameThickness / 2, 0, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            frameThickness,
            finalHeight + frameThickness * 2,
            frameDepth,
          ]}
        />
        <meshStandardMaterial color={frameColor} />
      </mesh>

      {/* Image plane (front) */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[finalWidth, finalHeight]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Back of print */}
      <mesh position={[0, 0, -0.002]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[finalWidth, finalHeight]} />
        <meshStandardMaterial color="#f5f0e8" />
      </mesh>

      {/* Selection highlight glow */}
      {isSelected && (
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry
            args={[finalWidth + 0.08, finalHeight + 0.08]}
          />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
};

export default FramedPrint;
