import { useBoothState } from '@hooks/useBoothStore';
import { PRINT_POSITIONS } from '@utils/boothConstants';
import FramedPrint from './FramedPrint';

const PrintsWall = () => {
  const { prints } = useBoothState();

  return (
    <group>
      {prints.map((print, index) => {
        const pos = PRINT_POSITIONS[index];
        if (!pos) return null;
        return <FramedPrint key={print.id} print={print} position={pos} />;
      })}
    </group>
  );
};

export default PrintsWall;
