import React from 'react';
import { cn } from '@/lib/utils';

// Mobile-optimized container component
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ 
  children, 
  className, 
  noPadding = false 
}) => {
  return (
    <div className={cn(
      "w-full",
      !noPadding && "px-4 sm:px-6 lg:px-8",
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({ 
  children, 
  className, 
  interactive = false 
}) => {
  return (
    <div className={cn(
      "bg-gradient-card border border-border rounded-lg shadow-card",
      "transition-all duration-200 ease-out",
      interactive && "hover:shadow-md active:scale-[0.99] cursor-pointer",
      "p-4 sm:p-6",
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized button component
interface MobileButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false
}) => {
  const baseClasses = cn(
    "inline-flex items-center justify-center font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "active:scale-95 touch-manipulation",
    fullWidth && "w-full"
  );

  const variantClasses = {
    primary: "bg-gradient-primary text-primary-foreground hover:shadow-lg shadow-elegant",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-muted",
    ghost: "hover:bg-muted hover:text-foreground"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-md min-h-[var(--touch-target-small)]",
    md: "px-4 py-3 text-base rounded-lg min-h-[var(--touch-target)]",
    lg: "px-6 py-4 text-lg rounded-xl min-h-12"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Mobile-optimized input component
interface MobileInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  className,
  error,
  required = false,
  type = 'text'
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 text-base bg-background border border-input rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-all duration-200 min-h-[var(--touch-target)]",
          error && "border-destructive focus:ring-destructive"
        )}
        required={required}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized navigation item
interface MobileNavItemProps {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = ({
  children,
  onClick,
  active = false,
  icon,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg",
        "transition-all duration-200 min-h-[var(--touch-target)]",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "active:scale-[0.98] touch-manipulation",
        active 
          ? "bg-gradient-primary text-primary-foreground shadow-elegant"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1 font-medium">{children}</span>
    </button>
  );
};