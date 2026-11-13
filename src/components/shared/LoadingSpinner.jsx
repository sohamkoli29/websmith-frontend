const SIZES = { sm: 18, md: 32, lg: 48, xl: 64 };

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const px = SIZES[size] || 32;
  return (
    <div role="status" aria-label="Loading" className={`flex items-center justify-center p-8 ${className}`}>
      <div
        style={{
          width: px, height: px, borderRadius: '50%',
          border: '3px solid var(--color-sand)', borderTopColor: 'var(--color-marigold)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
