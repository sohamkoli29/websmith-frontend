import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const px = { sm: 18, md: 32, lg: 48, xl: 64 }[size] || 32;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} className={className}>
      <div style={{
        width: px, height: px,
        border: '2px solid rgba(124,58,237,0.15)',
        borderTopColor: '#7c3aed',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );
};

export default LoadingSpinner;
