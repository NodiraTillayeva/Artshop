import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import artworksData from '../data/artworks.json';
import categoriesData from '../data/categories.json';

const ArtworkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);

  useEffect(() => {
    const foundArtwork = artworksData.find((art) => art.id === id);
    if (foundArtwork) {
      setArtwork(foundArtwork);
    }
  }, [id]);

  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Artwork Not Found</h1>
        <Link to="/gallery" className="text-primary-600 hover:underline">
          Back to Gallery
        </Link>
      </div>
    );
  }

  const category = categoriesData.find((cat) => cat.id === artwork.category);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-primary-600 hover:underline mb-6 flex items-center"
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative">
          <img
            src={artwork.images.full}
            alt={artwork.title}
            className="w-full rounded-lg shadow-lg"
          />
          {!artwork.available && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
              Sold
            </div>
          )}
        </div>

        {/* Info Section */}
        <div>
          <h1 className="text-4xl font-display font-bold mb-4">
            {artwork.title}
          </h1>

          <div className="mb-6">
            <span className="text-3xl font-bold text-primary-600">
              ${artwork.price}
            </span>
            {!artwork.available && (
              <span className="ml-4 text-red-600 font-semibold">
                (Sold Out)
              </span>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{category?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Medium:</span>
                <span className="font-medium">{artwork.medium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">{artwork.dimensions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{artwork.year}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
          </div>

          {artwork.available ? (
            <Link to={`/contact?artwork=${artwork.id}`}>
              <Button variant="accent" size="large" className="w-full md:w-auto">
                Inquire to Purchase
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" size="large" className="w-full md:w-auto" disabled>
              Sold Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetails;
