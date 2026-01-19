import { Link } from 'react-router-dom';
import Card from '../common/Card';

const ArtworkCard = ({ artwork }) => {
  return (
    <Link to={`/artwork/${artwork.id}`}>
      <Card className="group cursor-pointer hover:shadow-xl transition-shadow duration-300">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={artwork.images.thumbnail}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {!artwork.available && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Sold
            </div>
          )}
          {artwork.featured && (
            <div className="absolute top-2 left-2 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
            {artwork.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {artwork.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-primary-600 font-bold">${artwork.price}</span>
            <span className="text-gray-500 text-sm">{artwork.category}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ArtworkCard;
