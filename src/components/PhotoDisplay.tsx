import React from 'react';
import { LocalStorageService } from '@/services/local-storage-service';

interface PhotoDisplayProps {
  photoId: string;
  className?: string;
  alt?: string;
}

export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ photoId, className = '', alt = 'Inspection photo' }) => {
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
      // Return null to not render anything if no image is found
      return null;
    }
  }
  
  // Don't render image if no valid source
  if (!imageSrc || imageSrc === photoId && !isBase64 && !isUrl) {
    console.warn('PhotoDisplay: Invalid image source:', photoId);
    return null;
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt}
      className={className}
      onLoad={() => {
        console.log('PhotoDisplay: Image loaded successfully for photoId:', photoId);
      }}
      onError={(e) => {
        console.error('PhotoDisplay: Failed to load image for photoId:', photoId, 'imageSrc:', imageSrc);
        const target = e.target as HTMLImageElement;
        // Hide the image completely instead of showing placeholder
        target.style.display = 'none';
      }}
    />
  );
};