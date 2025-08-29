import React from 'react';

interface ProfessionalFooterProps {
  companyName: string;
  reportId: string;
  generatedDate: string;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
  inspectorName?: string;
  propertyLocation?: string;
}

export const ProfessionalFooter: React.FC<ProfessionalFooterProps> = ({
  companyName,
  reportId,
  generatedDate,
  pageNumber,
  totalPages,
  className = '',
  inspectorName,
  propertyLocation
}) => {
  // Format the generated date consistently
  const formattedDate = new Date(generatedDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Format the generated time
  const formattedTime = new Date(generatedDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <footer className={`professional-footer ${className}`}>
      <div className="footer-divider"></div>
      <div className="footer-content">
        <div className="footer-left">
          <img
            src="/logo.jpeg"
            alt={`${companyName} Logo`}
            className="footer-logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="footer-company-info">
            <div className="footer-company-name">{companyName}</div>
            <div className="footer-tagline">Professional Property Inspection Services</div>
            {inspectorName && (
              <div className="footer-inspector">Inspector: {inspectorName}</div>
            )}
          </div>
        </div>
        <div className="footer-center">
          <div className="footer-report-info">
            <div className="footer-report-id">Report ID: {reportId}</div>
            <div className="footer-generated">Generated: {formattedDate} at {formattedTime}</div>
            {propertyLocation && (
              <div className="footer-property">Property: {propertyLocation}</div>
            )}
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-page-number">
            {pageNumber && totalPages ? `Page ${pageNumber} of ${totalPages}` : 'Page 1'}
          </div>
          <div className="footer-confidential">
            This document is confidential and proprietary. All rights reserved.
          </div>
          <div className="footer-quality-mark">
            ✓ Professional Quality Assured
          </div>
        </div>
      </div>
      {/* Enhanced visual continuity elements */}
      <div className="footer-continuity-marker"></div>
      <div className="footer-brand-accent"></div>
    </footer>
  );
};