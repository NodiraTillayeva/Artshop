const LoadingSpinner = ({ size = 'medium' }) => {
  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
