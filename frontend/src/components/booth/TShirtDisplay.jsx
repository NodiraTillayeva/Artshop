import { useBoothState } from '@hooks/useBoothStore';
import { TSHIRT_POSITIONS } from '@utils/boothConstants';
import TShirt from './TShirt';

const TShirtDisplay = () => {
  const { tshirts } = useBoothState();

  return (
    <group>
      {tshirts.map((shirt, index) => {
        const pos = TSHIRT_POSITIONS[index];
        if (!pos) return null;
        return <TShirt key={shirt.id} tshirt={shirt} position={pos} />;
      })}
    </group>
  );
};

export default TShirtDisplay;
