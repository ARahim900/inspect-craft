import React from 'react';
import { cn } from '@/lib/utils';
import { PhotoDisplay } from './PhotoDisplay';

interface ProfessionalPhotoContainerProps {
  /** Array of photo IDs to display */
  photos: string[];
  /** Maximum number of photos to display */
  maxPhotos?: number;
  /** Title for the photo section */
  title?: string;
  /** Size variant for photos */
  size?: 'small' | 'medium' | 'large' | 'grid';
  /** Layout style for multiple photos */
  layout?: 'grid' | 'stack' | 'inline';
  /** Show photo captions */
  showCaptions?: boolean;
  /** Custom className */
  className?: string;
  /** Context for photo captions */
  context?: string;
}

/**
 * ProfessionalPhotoContainer - Enhanced photo display with professional treatment
 * 
 * Implements requirements 7.1-7.5:
 * - Professional photo sizing and positioning
 * - High-resolution display optimization
 * - Immediate visual connection with findings
 * - Direct integration eliminating separate appendices
 */
export const ProfessionalPhotoContainer: React.FC<ProfessionalPhotoContainerProps> = ({
  photos,
  maxPhotos = 4,
  title,
  size = 'grid',
  layout = 'grid',
  showCaptions = true,
  className,
  context = 'Evidence'
}) => {
  // Filter out empty or invalid photo IDs
  const validPhotos = photos.filter(photo => photo && photo.trim() !== '');
  
  if (validPhotos.length === 0) {
    return (
      <div className={cn('professional-photo-container no-photos-available', className)}>
        <div className="no-photos-message">
          <em>No photographic evidence available</em>
        </div>
      </div>
    );
  }

  // Limit photos to maxPhotos
  const displayPhotos = validPhotos.slice(0, maxPhotos);
  const hasMorePhotos = validPhotos.length > maxPhotos;

  // Generate layout classes
  const getLayoutClasses = () => {
    const layoutClasses = {
      grid: displayPhotos.length > 1 ? 'professional-photos-grid' : 'professional-photos-single',
      stack: 'professional-photos-stack',
      inline: 'professional-photos-inline'
    };
    
    return layoutClasses[layout];
  };

  return (
    <div className={cn(
      'professional-photo-evidence-container',
      getLayoutClasses(),
      className
    )}>
      {/* Optional title */}
      {title && (
        <div className="professional-photo-title">
          {title}
        </div>
      )}
      
      {/* Photo display area */}
      <div className="professional-photos-display">
        {displayPhotos.map((photoId, index) => (
          <PhotoDisplay
            key={`${photoId}-${index}`}
            photoId={photoId}
            professional={true}
            size={size}
            showCaption={showCaptions}
            caption={showCaptions ? `${context} ${index + 1}` : undefined}
            highRes={true}
            position="adjacent"
            className="professional-evidence-photo"
          />
        ))}
        
        {/* Additional photos indicator */}
        {hasMorePhotos && (
          <div className="additional-photos-professional">
            <div className="additional-count">
              +{validPhotos.length - maxPhotos} more
            </div>
            <div className="additional-note">
              Additional evidence available
            </div>
          </div>
        )}
      </div>
      
      {/* Professional evidence summary */}
      <div className="professional-evidence-summary">
        <span className="evidence-count">
          {displayPhotos.length} photo{displayPhotos.length !== 1 ? 's' : ''} shown
        </span>
        {hasMorePhotos && (
          <span className="evidence-total">
            ({validPhotos.length} total)
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfessionalPhotoContainer;