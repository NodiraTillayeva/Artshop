const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-display font-bold mb-8">About the Artist</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          Welcome to my digital art portfolio. I'm a passionate digital artist
          who loves to create unique and captivating artworks that tell stories
          and evoke emotions.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">My Journey</h2>
        <p className="text-gray-700 mb-6">
          My journey in digital art began several years ago, and since then,
          I've been constantly exploring new techniques and styles to express
          my creativity. Each piece is a labor of love, crafted with attention
          to detail and a deep appreciation for visual storytelling.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">My Work</h2>
        <p className="text-gray-700 mb-6">
          My portfolio showcases a diverse range of digital artworks, from
          abstract compositions to detailed illustrations. I draw inspiration
          from nature, technology, and the human experience, blending these
          elements to create something unique.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Connect With Me</h2>
        <p className="text-gray-700">
          I'm always excited to connect with fellow art enthusiasts and potential
          clients. Whether you're interested in purchasing a piece or commissioning
          custom artwork, feel free to reach out through the contact page.
        </p>
      </div>
    </div>
  );
};

export default About;
