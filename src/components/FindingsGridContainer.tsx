import React from 'react';
import { cn } from '@/lib/utils';
import { FindingGridItem } from './FindingGridItem';

interface InspectionItem {
  id: string;
  category: string;
  point: string;
  status: 'Pass' | 'Fail' | 'Snags';
  comments?: string;
  location?: string;
  photos: string[];
}

interface FindingsGridContainerProps {
  /** Array of inspection items to display */
  items: InspectionItem[];
  /** Optional className for styling */
  className?: string;
  /** Area name for context */
  areaName?: string;
  /** Whether to show area header */
  showAreaHeader?: boolean;
}

/**
 * FindingsGridContainer - Grid-based layout system for findings presentation
 * 
 * Implements requirements 5.1-5.4:
 * - CSS Grid system with 2/3 column for text and 1/3 column for images
 * - Structured content presentation replacing traditional table layout
 * - Perfect alignment of all elements within the grid system
 * - Dynamic grid presentation for findings
 */
export const FindingsGridContainer: React.FC<FindingsGridContainerProps> = ({
  items,
  className,
  areaName,
  showAreaHeader = true
}) => {
  if (items.length === 0) {
    return (
      <div className={cn("findings-grid-container", className)}>
        {showAreaHeader && areaName && (
          <h2 className="area-header">Area: {areaName}</h2>
        )}
        <div className="no-findings">
          <em>No inspection points recorded for this area.</em>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("findings-grid-container", className)}>
      {showAreaHeader && areaName && (
        <h2 className="area-header">Area: {areaName}</h2>
      )}
      
      <div className="findings-grid-list">
        {items.map((item, index) => (
          <FindingGridItem
            key={item.id}
            item={item}
            className={cn(
              "finding-item",
              index === 0 && "first-item",
              index === items.length - 1 && "last-item"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default FindingsGridContainer;