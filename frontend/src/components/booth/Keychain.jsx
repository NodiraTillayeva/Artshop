import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useBoothDispatch, useBoothState } from '@hooks/useBoothStore';

const Keychain = ({ keychain, position }) => {
  const meshRef = useRef();
  const dispatch = useBoothDispatch();
  const { selectedItem } = useBoothState();
  const [hovered, setHovered] = useState(false);
  const [pickedUp, setPickedUp] = useState(false);

  const isSelected = selectedItem?.id === keychain.id;

  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(keychain.dataUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [keychain.dataUrl]);

  // Slim extrusion — real acrylic keychain thickness
  const geometry = useMemo(() => {
    if (!keychain.shape) return null;
    const settings = {
      steps: 1,
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    };
    const geo = new THREE.ExtrudeGeometry(keychain.shape, settings);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, [keychain.shape]);

  const imageSize = useMemo(() => {
    if (!keychain.shape) return [0.07, 0.07];
    const points = keychain.shape.getPoints();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return [maxX - minX, maxY - minY];
  }, [keychain.shape]);

  useFrame((state) => {
    if (meshRef.current && !pickedUp) {
      meshRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.8 + position[0] * 10) * 0.06;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      setPickedUp((p) => !p);
    } else {
      dispatch({
        type: 'SELECT_ITEM',
        payload: { type: 'keychain', id: keychain.id },
      });
    }
  };

  const [clipScene, setClipScene] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load('/models/keychain_clip.glb', (loaded) => {
      const clip = loaded.scene.clone(true);
      const box = new THREE.Box3().setFromObject(clip);
      const size = new THREE.Vector3();
      box.getSize(size);
      // Scale clip to ~0.04 tall to fit above the acrylic body
      const s = 0.04 / Math.max(size.x, size.y, size.z);
      clip.scale.setScalar(s);
      clip.updateMatrixWorld(true);
      // Center and position at top
      const sBox = new THREE.Box3().setFromObject(clip);
      const center = new THREE.Vector3();
      sBox.getCenter(center);
      clip.position.set(-center.x, -sBox.min.y, -center.z);
      clip.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });
      setClipScene(clip);
    });
  }, []);

  if (!geometry) return null;

  return (
    <group position={position}>
      {/* Keychain clip (GLB) */}
      {clipScene && (
        <group position={[0, 0.045, 0]}>
          <primitive object={clipScene.clone(true)} />
        </group>
      )}

      <group
        ref={meshRef}
        position={pickedUp ? [0, 0.25, 0.4] : [0, 0, 0]}
        scale={pickedUp ? 2.5 : 1.0}
      >
        {/* Acrylic body — slim and see-through */}
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
        >
          <meshPhysicalMaterial
            color={hovered ? '#ffffff' : '#f5f5f5'}
            metalness={0.0}
            roughness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            transmission={0.55}
            ior={1.4}
            thickness={1.5}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Front face image */}
        <mesh position={[0, 0, 0.012]} renderOrder={1}>
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

        {/* Back face image */}
        <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]} renderOrder={1}>
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
        <mesh position={[0, 0, -0.04]}>
          <circleGeometry args={[0.06, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
};

export default Keychain;
