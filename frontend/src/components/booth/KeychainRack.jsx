import { useRef, useState } from 'react';
import { useBoothState } from '@hooks/useBoothStore';
import { KEYCHAIN_POSITIONS } from '@utils/boothConstants';
import Keychain from './Keychain';

const KeychainRack = () => {
  const { keychains } = useBoothState();

  return (
    <group position={[-0.88, 0.75, 0.3]}>
      {keychains.map((kc, index) => {
        const pos = KEYCHAIN_POSITIONS[index];
        if (!pos) return null;
        return <Keychain key={kc.id} keychain={kc} position={pos} />;
      })}
    </group>
  );
};

export default KeychainRack;
