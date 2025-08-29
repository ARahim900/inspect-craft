import React from 'react';

interface ProfessionalHeaderProps {
  companyName: string;
  reportTitle: string;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
  reportId?: string;
  inspectionDate?: string;
}

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  companyName,
  reportTitle,
  pageNumber,
  totalPages,
  className = '',
  reportId,
  inspectionDate
}) => {
  // Format the inspection date consistently
  const formattedDate = inspectionDate 
    ? new Date(inspectionDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '';

  return (
    <header className={`professional-header ${className}`}>
      <div className="header-content">
        <div className="header-left">
          <img
            src="/logo.jpeg"
            alt={`${companyName} Logo`}
            className="header-logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="header-branding">
            <div className="header-company-name">{companyName}</div>
            <div className="header-tagline">Professional Property Inspection</div>
          </div>
        </div>
        <div className="header-center">
          <div className="header-report-title">{reportTitle}</div>
          {reportId && (
            <div className="header-report-id">Report ID: {reportId}</div>
          )}
          {formattedDate && (
            <div className="header-inspection-date">Inspection: {formattedDate}</div>
          )}
        </div>
        <div className="header-right">
          <div className="header-page-info">
            {pageNumber && totalPages ? `Page ${pageNumber} of ${totalPages}` : 'Page 1'}
          </div>
          <div className="header-timestamp">
            {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
      </div>
      <div className="header-divider"></div>
      {/* Enhanced visual continuity elements */}
      <div className="header-continuity-marker"></div>
      <div className="header-brand-accent"></div>
    </header>
  );
};