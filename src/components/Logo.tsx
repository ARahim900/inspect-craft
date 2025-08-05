import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className, showText = true }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8', 
    large: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-lg font-semibold',
    medium: 'text-xl md:text-2xl font-bold',
    large: 'text-3xl md:text-4xl font-bold'
  };

  const FallbackIcon = () => (
    <svg 
      className={cn(sizeClasses[size], "text-primary")} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
      />
    </svg>
  );

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <img 
          src="/logo.jpeg" 
          alt="InspectCraft Logo" 
          className={cn(sizeClasses[size], "object-contain rounded shadow-sm")}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              target.style.display = 'none';
              const fallbackDiv = document.createElement('div');
              fallbackDiv.innerHTML = `
                <svg class="${cn(sizeClasses[size], "text-primary")}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              `;
              parent.appendChild(fallbackDiv);
            }
          }}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className={cn(textSizeClasses[size], "text-foreground tracking-tight leading-tight")}>
            <span className="text-primary font-extrabold">Solution</span>
            <span className="text-foreground font-light ml-2">Property</span>
          </h1>
          {size === 'medium' || size === 'large' ? (
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mt-0.5">
              Property Inspection Services
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Logo;