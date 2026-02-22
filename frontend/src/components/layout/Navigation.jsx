import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/gallery', label: 'My Booth' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const linkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? 'text-primary-600 font-semibold'
        : 'text-gray-700 hover:text-primary-600'
    }`;

  return (
    <nav>
      {/* Desktop Navigation */}
      <ul className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-700 hover:text-primary-600"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <ul className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg py-4 px-4 space-y-4">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={linkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navigation;
