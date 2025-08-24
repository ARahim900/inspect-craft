import React from 'react';
import { cn } from '@/lib/utils';

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridCols = cn(
    'grid',
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    gapClasses[gap]
  );

  return (
    <div className={cn(gridCols, className)}>
      {children}
    </div>
  );
};

// Responsive stack component
interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  direction = 'vertical',
  spacing = 'md',
  align = 'start',
  wrap = false
}) => {
  const spacingClasses = {
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center', 
    end: 'items-end'
  };

  const baseClasses = cn(
    'flex',
    direction === 'vertical' ? 'flex-col' : 'flex-row',
    alignClasses[align],
    spacingClasses[spacing],
    wrap && 'flex-wrap'
  );

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
};

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
  responsive?: boolean;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = 'md',
  weight = 'normal',
  color = 'default',
  align = 'left',
  responsive = true
}) => {
  const sizeClasses = responsive ? {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl'
  } : {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colorClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={cn(
      sizeClasses[size],
      weightClasses[weight],
      colorClasses[color],
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive container with max-width breakpoints
interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  padding?: boolean;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className,
  maxWidth = 'lg',
  centered = true,
  padding = true
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn(
      'w-full',
      maxWidthClasses[maxWidth],
      centered && 'mx-auto',
      padding && 'px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-first responsive breakpoint hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xs');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1400) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 640) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isLarge: breakpoint === 'xl' || breakpoint === '2xl'
  };
};