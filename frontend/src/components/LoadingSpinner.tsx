import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary`}></div>
    </div>
  );
};

export default LoadingSpinner; 