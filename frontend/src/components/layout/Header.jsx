import { Link } from 'react-router-dom';
import Navigation from './Navigation';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-display font-bold text-gray-900">
            Artshop
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Header;
