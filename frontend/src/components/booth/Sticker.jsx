import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useBoothDispatch, useBoothState } from '@hooks/useBoothStore';

const MAX_VISIBLE_STACK = 6; // cap visible copies so it doesn't get absurd
const STACK_SPACING_RATIO = 0.09; // gap between copies as fraction of cellSize

const Sticker = ({ sticker, position, cellSize = 0.13 }) => {
  const meshRef = useRef();
  const dispatch = useBoothDispatch();
  const { selectedItem } = useBoothState();
  const [hovered, setHovered] = useState(false);
  const [pickedUp, setPickedUp] = useState(false);

  const isSelected = selectedItem?.id === sticker.id;
  const stockCount = sticker.stock ?? 1;
  const visibleCopies = Math.min(stockCount, MAX_VISIBLE_STACK);

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(sticker.dataUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [sticker.dataUrl]);

  // Paper-thin vinyl sticker — minimal depth and bevel
  const geometry = useMemo(() => {
    if (!sticker.shape) return null;
    const settings = {
      steps: 1,
      depth: 0.001,
      bevelEnabled: true,
      bevelThickness: 0.0003,
      bevelSize: 0.0003,
      bevelSegments: 1,
    };
    const geo = new THREE.ExtrudeGeometry(sticker.shape, settings);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, [sticker.shape]);

  const imageSize = useMemo(() => {
    if (!sticker.shape) return [0.07, 0.07];
    const points = sticker.shape.getPoints();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return [maxX - minX, maxY - minY];
  }, [sticker.shape]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      setPickedUp((p) => !p);
    } else {
      dispatch({
        type: 'SELECT_ITEM',
        payload: { type: 'sticker', id: sticker.id },
      });
    }
  };

  const { camera } = useThree();

  // Scale sticker to fit its grid cell — derived from stand geometry
  const stackSpacing = cellSize * STACK_SPACING_RATIO;
  const maxDim = Math.max(imageSize[0], imageSize[1]);
  const fitScale = maxDim > 0 ? cellSize / maxDim : 1;

  // Offset so the bottom edge sits on the shelf surface
  const scaledHeight = imageSize[1] * fitScale;
  const yOffset = scaledHeight / 2;

  // Front Z position for the interactive display sticker
  const frontZ = (visibleCopies - 1) * stackSpacing;

  // When picked up, position sticker in front of camera each frame
  useFrame(() => {
    if (!meshRef.current) return;
    if (pickedUp) {
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const worldPos = camera.position.clone().add(dir.multiplyScalar(0.4));
      meshRef.current.parent.updateWorldMatrix(true, false);
      const localPos = meshRef.current.parent.worldToLocal(worldPos.clone());
      meshRef.current.position.copy(localPos);
      meshRef.current.quaternion.copy(camera.quaternion);
      meshRef.current.scale.setScalar(2.5);
    } else {
      meshRef.current.position.set(0, 0, frontZ);
      meshRef.current.scale.setScalar(fitScale);
      meshRef.current.rotation.set(-0.12, 0, 0);
    }
  });

  if (!geometry) return null;

  return (
    <group position={[position[0], position[1] + yOffset, position[2]]}>
      {/* Back copies — plain models extending forward from back wall */}
      {visibleCopies > 2 &&
        Array.from({ length: visibleCopies - 2 }, (_, i) => (
          <group
            key={`stack-${i}`}
            position={[0, 0, i * stackSpacing]}
            scale={fitScale}
            rotation={[-0.12, 0, 0]}
          >
            <mesh geometry={geometry} castShadow>
              <meshPhysicalMaterial
                color="#f0f0f0"
                metalness={0.0}
                roughness={0.15}
                clearcoat={0.4}
                clearcoatRoughness={0.2}
              />
            </mesh>
          </group>
        ))}

      {/* Second-from-front copy — textured display */}
      {visibleCopies > 1 && (
        <group
          position={[0, 0, (visibleCopies - 2) * stackSpacing]}
          scale={fitScale}
          rotation={[-0.12, 0, 0]}
        >
          <mesh geometry={geometry} castShadow>
            <meshPhysicalMaterial
              color="#fafafa"
              metalness={0.0}
              roughness={0.1}
              clearcoat={0.6}
              clearcoatRoughness={0.15}
            />
          </mesh>
          <mesh position={[0, 0, 0.002]} renderOrder={1}>
            <planeGeometry args={imageSize} />
            <meshBasicMaterial
              map={texture}
              transparent
              alphaTest={0.05}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        </group>
      )}

      {/* Front sticker (interactive, textured) — positioned by useFrame */}
      <group ref={meshRef}>
        <mesh
          geometry={geometry}
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
          <meshPhysicalMaterial
            color={hovered ? '#ffffff' : '#fafafa'}
            metalness={0.0}
            roughness={0.1}
            clearcoat={0.6}
            clearcoatRoughness={0.15}
          />
        </mesh>

        {/* Front image */}
        <mesh position={[0, 0, 0.002]} renderOrder={1}>
          <planeGeometry args={imageSize} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      </group>

      {isSelected && (
        <mesh position={[0, 0, frontZ - 0.03]}>
          <circleGeometry args={[0.06, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

export default Sticker;
