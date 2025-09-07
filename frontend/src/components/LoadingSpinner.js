import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'orange', 
  className = '',
  text = 'Loading...',
  fullPage = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    red: 'border-red-500',
    green: 'border-green-500',
    gray: 'border-gray-500',
    orange: 'border-orange-500'
  };

  const containerClasses = fullPage 
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-2 border-t-transparent 
          rounded-full 
          animate-spin
          will-change-transform
        `}
        role="status"
        aria-label={text || "Loading"}
        style={{ 
          contain: 'layout style paint',
          contentVisibility: 'auto'
        }}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{text}</p>
      )}
      <div className="sr-only">Content is loading, please wait...</div>
    </div>
  );
};

export default LoadingSpinner;