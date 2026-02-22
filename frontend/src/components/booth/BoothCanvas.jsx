import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import BoothScene from './BoothScene';

const BoothCanvas = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.4, 5.5], fov: 50 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => {
        // Clicking empty space deselects — handled by BoothScene
      }}
    >
      <BoothScene />
    </Canvas>
  );
};

export default BoothCanvas;
