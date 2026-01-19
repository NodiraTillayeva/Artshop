import { useState, useEffect } from 'react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import FilterBar from '../components/gallery/FilterBar';
import artworksData from '../data/artworks.json';
import categoriesData from '../data/categories.json';

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setArtworks(artworksData);
    setFilteredArtworks(artworksData);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredArtworks(artworks);
    } else {
      setFilteredArtworks(
        artworks.filter((artwork) => artwork.category === selectedCategory)
      );
    }
  }, [selectedCategory, artworks]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display font-bold mb-4">Gallery</h1>
      <p className="text-gray-600 mb-8">
        Explore my collection of digital artworks. Click on any piece to see more details.
      </p>

      <FilterBar
        categories={categoriesData}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <GalleryGrid artworks={filteredArtworks} />
    </div>
  );
};

export default Gallery;
