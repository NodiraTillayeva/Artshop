import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-primary-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            Digital Art Portfolio
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Explore unique digital artworks created with passion and creativity.
            Each piece tells a story waiting to be discovered.
          </p>
          <Link
            to="/gallery"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Visit My Booth
          </Link>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Featured Artworks
          </h2>
          <div className="text-center text-gray-600">
            <p className="mb-4">Featured artworks will be displayed here.</p>
            <Link to="/gallery" className="text-primary-600 hover:underline">
              Visit the booth →
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold mb-6">
              About the Artist
            </h2>
            <p className="text-gray-700 mb-6">
              A passionate digital artist creating unique pieces that blend
              creativity with technology. Each artwork is crafted with attention
              to detail and a love for visual storytelling.
            </p>
            <Link
              to="/about"
              className="inline-block text-primary-600 font-semibold hover:underline"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Interested in a Piece?
          </h2>
          <p className="text-gray-700 mb-8">
            Get in touch to inquire about purchasing artwork or commissioning
            a custom piece.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-accent-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors"
          >
            Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
