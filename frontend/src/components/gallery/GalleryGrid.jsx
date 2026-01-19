import ArtworkCard from './ArtworkCard';

const GalleryGrid = ({ artworks }) => {
  if (!artworks || artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No artworks found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
};

export default GalleryGrid;
