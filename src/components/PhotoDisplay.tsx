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
    }
  }
  
  return (
    <img 
      src={imageSrc} 
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik04NSA4NUgxMTVWMTE1SDg1Vjg1WiIgZmlsbD0iIzlDQTNCRiIvPgo8L3N2Zz4=';
        target.alt = 'Image not found';
      }}
    />
  );
};