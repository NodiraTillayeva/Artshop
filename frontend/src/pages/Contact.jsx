import { useSearchParams } from 'react-router-dom';
import ContactForm from '../components/contact/ContactForm';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const artworkId = searchParams.get('artwork');

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-display font-bold mb-4">Get in Touch</h1>
      <p className="text-gray-600 mb-8">
        {artworkId
          ? "Interested in this artwork? Fill out the form below and I'll get back to you soon."
          : "Have a question or want to discuss a commission? I'd love to hear from you!"}
      </p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <ContactForm artworkId={artworkId} />
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          You can also reach me directly at{' '}
          <a href="mailto:artist@example.com" className="text-primary-600 hover:underline">
            artist@example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Contact;
