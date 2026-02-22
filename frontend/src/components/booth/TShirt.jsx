import { useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useBoothDispatch, useBoothState } from '@hooks/useBoothStore';

const TShirt = ({ tshirt, position }) => {
  const dispatch = useBoothDispatch();
  const { selectedItem } = useBoothState();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  const isSelected = selectedItem?.id === tshirt.id;

  // Load the design texture for mapping onto the model
  const designTexture = useMemo(() => {
    if (!tshirt.designUrl) return null;
    const tex = new THREE.TextureLoader().load(tshirt.designUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    return tex;
  }, [tshirt.designUrl]);

  // Load the GLB model
  const [gltf, setGltf] = useState(null);
  useEffect(() => {
    if (!tshirt.modelUrl) return;
    const loader = new GLTFLoader();
    loader.load(
      tshirt.modelUrl,
      (loaded) => setGltf(loaded),
      undefined,
      (err) => console.warn('GLB load error:', err)
    );
  }, [tshirt.modelUrl]);

  // Clone and prepare the model scene
  const modelScene = useMemo(() => {
    if (!gltf) return null;
    const clone = gltf.scene.clone(true);

    // Wrap in a group for easier transform handling
    const wrapper = new THREE.Group();
    wrapper.add(clone);
    wrapper.updateMatrixWorld(true);

    // Compute initial bounding box
    const box = new THREE.Box3().setFromObject(wrapper);
    const size = new THREE.Vector3();
    box.getSize(size);

    // If model is Z-up (Z is tallest dimension), rotate to Y-up
    if (size.z > size.y * 1.3) {
      clone.rotation.x = -Math.PI / 2;
      wrapper.updateMatrixWorld(true);
    }

    // Recompute bounding box after potential rotation
    const rotatedBox = new THREE.Box3().setFromObject(wrapper);
    const rotatedSize = new THREE.Vector3();
    rotatedBox.getSize(rotatedSize);

    // Scale to target height
    const targetHeight = 0.65;
    const maxDim = Math.max(rotatedSize.x, rotatedSize.y, rotatedSize.z);
    const scale = targetHeight / maxDim;
    wrapper.scale.setScalar(scale);
    wrapper.updateMatrixWorld(true);

    // Center horizontally + in depth, align top near hanger bar
    const scaledBox = new THREE.Box3().setFromObject(wrapper);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    const scaledSize = new THREE.Vector3();
    scaledBox.getSize(scaledSize);

    wrapper.position.set(
      -center.x,                                    // center horizontally
      0.33 - (center.y + scaledSize.y / 2),         // top near hanger at y=0.33
      -center.z + 0.05                              // slightly in front of backdrop
    );

    // Apply the design texture to the main mesh if provided
    wrapper.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        if (designTexture) {
          child.material = child.material.clone();
          child.material.map = designTexture;
          child.material.needsUpdate = true;
        }
        // Interaction support
        child.userData.tshirtId = tshirt.id;
      }
    });

    return wrapper;
  }, [gltf, designTexture, tshirt.id]);

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch({
      type: 'SELECT_ITEM',
      payload: { type: 'tshirt', id: tshirt.id },
    });
  };

  const pointerHandlers = {
    onClick: handleClick,
    onPointerOver: (e) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      setHovered(false);
      document.body.style.cursor = 'default';
    },
  };

  return (
    <group position={position} ref={groupRef}>
      {/* Hanger hook */}
      <mesh position={[0, 0.38, 0]}>
        <torusGeometry args={[0.025, 0.004, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Hanger bar */}
      <mesh position={[0, 0.355, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.3, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.3} />
      </mesh>

      {modelScene ? (
        // Render the uploaded GLB model
        <group {...pointerHandlers}>
          <primitive object={modelScene} />
        </group>
      ) : (
        // Fallback: flat t-shirt preview with design image
        <FlatTShirt
          tshirt={tshirt}
          hovered={hovered}
          pointerHandlers={pointerHandlers}
        />
      )}

      {/* Selection glow */}
      {isSelected && (
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[0.5, 0.8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.25} />
        </mesh>
      )}
    </group>
  );
};

// Flat fallback when no GLB model is provided
const FlatTShirt = ({ tshirt, hovered, pointerHandlers }) => {
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(tshirt.dataUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [tshirt.dataUrl]);

  return (
    <>
      {/* Simple flat rectangle with rounded corners showing the design */}
      <mesh {...pointerHandlers} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.01]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : '#f0f0f0'}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Design image on front */}
      <mesh position={[0, 0.02, 0.008]} renderOrder={1}>
        <planeGeometry args={[0.3, 0.3]} />
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
    </>
  );
};

export default TShirt;
