import React from 'react';
import { cn } from '@/lib/utils';

interface GridLayoutContainerProps {
  textContent: React.ReactNode;
  imageContent: React.ReactNode;
  className?: string;
  /** Optional ID for the grid container */
  id?: string;
  /** Whether to reverse the layout (image first, then text) */
  reverse?: boolean;
}

/**
 * GridLayoutContainer - Professional grid-based layout system for findings presentation
 * 
 * Implements a 2/3 text, 1/3 image grid system as specified in requirements 5.1-5.4:
 * - 2/3 column layout for text content
 * - 1/3 column layout for images
 * - Perfect alignment of all elements within the grid system
 * - Dynamic presentation replacing traditional table layouts
 */
export const GridLayoutContainer: React.FC<GridLayoutContainerProps> = ({
  textContent,
  imageContent,
  className,
  id,
  reverse = false
}) => {
  return (
    <div
      id={id}
      className={cn(
        "grid-layout-container",
        reverse && "grid-layout-reverse",
        className
      )}
    >
      {reverse ? (
        <>
          <div className="grid-image-section">
            {imageContent}
          </div>
          <div className="grid-text-section">
            {textContent}
          </div>
        </>
      ) : (
        <>
          <div className="grid-text-section">
            {textContent}
          </div>
          <div className="grid-image-section">
            {imageContent}
          </div>
        </>
      )}
    </div>
  );
};

export default GridLayoutContainer;