import { BoothProvider } from '@hooks/useBoothStore';
import BoothCanvas from '@components/booth/BoothCanvas';
import UploadPanel from '@components/booth/UploadPanel';
import InspectOverlay from '@components/booth/InspectOverlay';
import SectionNav from '@components/booth/SectionNav';

const Gallery = () => {
  return (
    <BoothProvider>
      <div className="relative w-full" style={{ height: 'calc(100vh - 4rem)' }}>
        <BoothCanvas />
        <SectionNav />
        <UploadPanel />
        <InspectOverlay />
      </div>
    </BoothProvider>
  );
};

export default Gallery;
