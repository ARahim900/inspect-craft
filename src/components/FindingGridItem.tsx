import React from 'react';
import { cn } from '@/lib/utils';
import { GridLayoutContainer } from './GridLayoutContainer';
import { ProfessionalPhotoContainer } from './ProfessionalPhotoContainer';

interface FindingGridItemProps {
  /** The inspection item data */
  item: {
    id: string;
    category: string;
    point: string;
    status: 'Pass' | 'Fail' | 'Snags';
    comments?: string;
    location?: string;
    photos: string[];
  };
  /** Optional className for styling */
  className?: string;
  /** Maximum number of photos to display */
  maxPhotos?: number;
}

/**
 * FindingGridItem - Grid-based presentation for individual inspection findings
 * 
 * Replaces traditional table layout with dynamic grid presentation as per requirements:
 * - Uses 2/3 text, 1/3 image grid layout
 * - Ensures perfect alignment of all elements
 * - Provides structured content presentation
 */
export const FindingGridItem: React.FC<FindingGridItemProps> = ({
  item,
  className,
  maxPhotos = 2
}) => {
  // Text content for the finding
  const textContent = (
    <div className="finding-content">
      <div className="finding-header">
        <h3 className="finding-category">{item.category}</h3>
        <span className={cn(
          "finding-status inline-block px-2 py-1 rounded text-xs font-bold",
          item.status === 'Pass' && "status-pass",
          item.status === 'Fail' && "status-fail",
          item.status === 'Snags' && "status-snags"
        )}>
          {item.status}
        </span>
      </div>
      
      <p className="finding-point">{item.point}</p>
      
      {item.comments && (
        <div className="finding-comments">
          <strong>Comments:</strong> {item.comments}
        </div>
      )}
      
      {item.location && (
        <div className="finding-location">
          <strong>Location:</strong> {item.location}
        </div>
      )}
    </div>
  );

  // Image content for the finding - Professional photo treatment
  const imageContent = (
    <div className="finding-evidence">
      <ProfessionalPhotoContainer
        photos={item.photos}
        maxPhotos={maxPhotos}
        size="grid"
        layout={item.photos.length > 2 ? "grid" : "stack"}
        showCaptions={true}
        context="Evidence"
        className="finding-photo-evidence"
      />
    </div>
  );

  return (
    <div className={cn("finding-item-grid", className)}>
      <GridLayoutContainer
        textContent={textContent}
        imageContent={imageContent}
        className="finding-grid-layout"
      />
    </div>
  );
};

export default FindingGridItem;