import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LocalStorageService } from '@/services/local-storage-service';

interface PhotoDisplayProps {
  photoId: string;
  className?: string;
  alt?: string;
  /** Professional treatment mode for enhanced display */
  professional?: boolean;
  /** Size variant for different contexts */
  size?: 'small' | 'medium' | 'large' | 'grid';
  /** Show caption with photo metadata */
  showCaption?: boolean;
  /** Caption text override */
  caption?: string;
  /** Enable high-resolution display optimization */
  highRes?: boolean;
  /** Position relative to text content */
  position?: 'adjacent' | 'inline' | 'standalone';
}

/**
 * Enhanced PhotoDisplay component with professional treatment
 * 
 * Implements requirements 7.1-7.5:
 * - Photo sizing to occupy approximately one-third of finding's width
 * - High resolution display and proper positioning adjacent to descriptions
 * - Immediate visual connection between findings and evidence photos
 * - Direct integration with content eliminating need for separate appendices
 */
export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ 
  photoId, 
  className = '', 
  alt = 'Inspection photo',
  professional = true,
  size = 'grid',
  showCaption = true,
  caption,
  highRes = true,
  position = 'adjacent'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if it's a base64 image or a photo ID
  const isBase64 = photoId.startsWith('data:');
  const isUrl = photoId.startsWith('http://') || photoId.startsWith('https://');
  
  let imageSrc = photoId;
  
  if (!isBase64 && !isUrl) {
    // It's a photo ID, get from local storage
    const base64 = LocalStorageService.getPhoto(photoId);
    if (base64) {
      imageSrc = base64;
    } else {
      console.warn('PhotoDisplay: No image found for photoId:', photoId);
      return null;
    }
  }
  
  // Don't render image if no valid source
  if (!imageSrc || imageSrc === photoId && !isBase64 && !isUrl) {
    console.warn('PhotoDisplay: Invalid image source:', photoId);
    return null;
  }

  // Handle image load to capture dimensions for professional treatment
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    
    if (imgRef.current && professional) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      
      // Log high-resolution status for professional treatment
      const isHighRes = naturalWidth >= 1200 || naturalHeight >= 1200;
      console.log(`PhotoDisplay: Professional image loaded - ${naturalWidth}x${naturalHeight} (${isHighRes ? 'High-res' : 'Standard'}) for photoId:`, photoId);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('PhotoDisplay: Failed to load image for photoId:', photoId, 'imageSrc:', imageSrc);
    setImageError(true);
    setImageLoaded(false);
    
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  // Generate professional caption
  const getCaption = () => {
    if (caption) return caption;
    if (!showCaption) return null;
    
    const baseCaption = alt;
    if (professional && imageDimensions) {
      const resolutionInfo = imageDimensions.width >= 1200 || imageDimensions.height >= 1200 ? 'High-res' : 'Standard';
      return `${baseCaption} (${imageDimensions.width}×${imageDimensions.height}, ${resolutionInfo})`;
    }
    
    return baseCaption;
  };

  // Professional size classes based on requirements
  const getSizeClasses = () => {
    const baseClasses = {
      small: 'professional-photo-small',
      medium: 'professional-photo-medium', 
      large: 'professional-photo-large',
      grid: 'professional-photo-grid' // One-third width for grid layout
    };
    
    return baseClasses[size];
  };

  // Position classes for adjacent placement
  const getPositionClasses = () => {
    const positionClasses = {
      adjacent: 'photo-position-adjacent',
      inline: 'photo-position-inline',
      standalone: 'photo-position-standalone'
    };
    
    return positionClasses[position];
  };

  // Professional treatment wrapper
  if (professional) {
    return (
      <div className={cn(
        'professional-photo-container',
        getSizeClasses(),
        getPositionClasses(),
        imageLoaded && 'photo-loaded',
        imageError && 'photo-error',
        className
      )}>
        <div className="professional-photo-frame">
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt={alt}
            className={cn(
              'professional-photo-image',
              highRes && 'high-resolution-optimized'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager" // Ensure immediate loading for professional display
          />
          
          {/* Professional overlay for visual connection */}
          <div className="professional-photo-overlay">
            <div className="photo-quality-indicator">
              {imageDimensions && (imageDimensions.width >= 1200 || imageDimensions.height >= 1200) && (
                <span className="high-res-badge">HD</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Professional caption with metadata */}
        {showCaption && getCaption() && (
          <div className="professional-photo-caption">
            {getCaption()}
          </div>
        )}
        
        {/* Visual connection indicator */}
        <div className="photo-evidence-connector" />
      </div>
    );
  }

  // Standard display (fallback)
  return (
    <img 
      ref={imgRef}
      src={imageSrc} 
      alt={alt}
      className={cn(getSizeClasses(), className)}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};