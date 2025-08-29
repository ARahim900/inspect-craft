import React from 'react';
import { cn } from '@/lib/utils';
import { EnhancedTable } from './EnhancedTable';
import { PhotoDisplay } from './PhotoDisplay';

interface InspectionItem {
  id: string;
  category: string;
  point: string;
  status: 'Pass' | 'Fail' | 'Snags';
  comments?: string;
  location?: string;
  photos: string[];
}

interface InspectionTableProps {
  /** Array of inspection items to display */
  items: InspectionItem[];
  /** Optional className for styling */
  className?: string;
  /** Maximum number of photos to display per item */
  maxPhotos?: number;
}

/**
 * InspectionTable - Enhanced table component for inspection findings
 * 
 * Uses the EnhancedTable component to display inspection data with:
 * - Clean design with horizontal dividers only
 * - Bold formatting exclusively in Grade/Status column
 * - Strategic color application for different statuses
 * - Professional layout that maintains readability
 */
export const InspectionTable: React.FC<InspectionTableProps> = ({
  items,
  className,
  maxPhotos = 2
}) => {
  const headers = [
    'Inspection Point',
    'Status',
    'Comments & Location',
    'Photographic Evidence'
  ];

  const columnWidths = ['30%', '12%', '28%', '30%'];

  const rows = items.map((item) => {
    // Format the inspection point cell
    const inspectionPointCell = (
      <div className="inspection-point-content">
        <div className="category-text" style={{ fontWeight: 'bold', marginBottom: '2mm' }}>
          {item.category}
        </div>
        <div className="point-text" style={{ fontSize: '9pt', lineHeight: '1.3' }}>
          {item.point}
        </div>
      </div>
    );

    // Format the status cell with appropriate styling
    const statusCell = (
      <span className={cn(
        "status-badge",
        item.status === 'Pass' && "status-pass",
        item.status === 'Fail' && "status-fail",
        item.status === 'Snags' && "status-snags"
      )}>
        {item.status}
      </span>
    );

    // Format the comments and location cell
    const commentsCell = (
      <div className="comments-content">
        {item.comments && (
          <div className="comments-text" style={{ marginBottom: '2mm' }}>
            <strong>Comments:</strong> {item.comments}
          </div>
        )}
        {item.location && (
          <div className="location-text">
            <strong>Location:</strong> {item.location}
          </div>
        )}
        {!item.comments && !item.location && (
          <em style={{ color: '#6b7280', fontSize: '9pt' }}>No additional details</em>
        )}
      </div>
    );

    // Format the photos cell
    const photosCell = (
      <div className="photos-content">
        {item.photos.length > 0 ? (
          <div className="photo-grid-print">
            {item.photos.slice(0, maxPhotos).map((photoId, idx) => (
              <div key={idx} className="photo-item-container">
                <PhotoDisplay
                  photoId={photoId}
                  className="photo-item-print"
                  alt={`Evidence ${idx + 1} for ${item.category}`}
                />
                <div className="photo-caption-print">
                  Photo {idx + 1}
                </div>
              </div>
            ))}
            {item.photos.length > maxPhotos && (
              <div className="additional-photos-indicator" style={{ 
                fontSize: '8pt', 
                color: '#6b7280', 
                fontStyle: 'italic',
                marginTop: '1mm'
              }}>
                +{item.photos.length - maxPhotos} more photo{item.photos.length - maxPhotos > 1 ? 's' : ''}
              </div>
            )}
          </div>
        ) : (
          <em style={{ color: '#6b7280', fontSize: '9pt' }}>No photos available</em>
        )}
      </div>
    );

    // Determine if this row should have Grade D highlighting
    const grade = item.status === 'Fail' ? 'D' : undefined;

    return {
      id: item.id,
      cells: [inspectionPointCell, statusCell, commentsCell, photosCell],
      grade,
      className: cn(
        'inspection-row',
        item.status === 'Fail' && 'fail-row',
        item.status === 'Pass' && 'pass-row',
        item.status === 'Snags' && 'snags-row'
      )
    };
  });

  if (items.length === 0) {
    return (
      <div className={cn("no-inspection-items", className)}>
        <em style={{ color: '#6b7280', fontSize: '10pt' }}>
          No inspection points recorded for this area.
        </em>
      </div>
    );
  }

  return (
    <EnhancedTable
      headers={headers}
      rows={rows}
      gradeColumn={1} // Status column for bold formatting
      columnWidths={columnWidths}
      className={cn("inspection-enhanced-table", className)}
    />
  );
};

export default InspectionTable;