import React from 'react';

interface TouchButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'xl';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export default function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'large',
  disabled = false,
  className = '',
  fullWidth = false,
}: TouchButtonProps) {
  const baseClasses = 'font-semibold rounded-touch transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variantClasses = {
    primary: 'bg-[#FF6B35] hover:bg-[#E85D2A] text-white shadow-md hover:shadow-lg active:shadow-sm',
    secondary: 'bg-[#004E89] hover:bg-[#003D6B] text-white shadow-md hover:shadow-lg active:shadow-sm',
    success: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-md hover:shadow-lg active:shadow-sm',
    outline: 'bg-white border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50 shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 shadow-none',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-base min-h-touch',
    medium: 'px-6 py-3 text-touch min-h-touch-lg',
    large: 'px-8 py-4 text-touch-lg min-h-touch-xl',
    xl: 'px-10 py-5 text-touch-xl min-h-[80px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!disabled) {
      e.currentTarget.classList.add('scale-[0.98]');
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.currentTarget.classList.remove('scale-[0.98]');
  };

  return (
    <button
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}
