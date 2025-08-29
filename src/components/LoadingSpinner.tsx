import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg border">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

// Page Loading Component
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Section Loading Component
export function SectionLoading({ 
  message = "Loading...",
  height = "h-32" 
}: { 
  message?: string;
  height?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center", height)}>
      <LoadingSpinner text={message} />
    </div>
  );
}

// Button Loading State
export function ButtonLoading({ 
  children, 
  loading = false,
  size = 'sm'
}: { 
  children: React.ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className={cn("animate-spin", sizeClasses[size])} />}
      {children}
    </div>
  );
}