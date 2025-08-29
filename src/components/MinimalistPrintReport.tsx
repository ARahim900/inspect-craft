import React from 'react';
import { SavedInspection } from '@/services/storage-service';
import { PhotoDisplay } from './PhotoDisplay';
import { LocalStorageService } from '@/services/local-storage-service';

interface MinimalistPrintReportProps {
  inspection: SavedInspection;
  onBack: () => void;
}

export const MinimalistPrintReport: React.FC<MinimalistPrintReportProps> = ({ inspection, onBack }) => {
  const handlePrint = () => {
    // Ensure all content is loaded before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const calculateStats = () => {
    let passCount = 0;
    let failCount = 0;
    let snagsCount = 0;
    let totalItems = 0;

    inspection.areas.forEach(area => {
      area.items.forEach(item => {
        totalItems++;
        switch (item.status) {
          case 'Pass':
            passCount++;
            break;
          case 'Fail':
            failCount++;
            break;
          case 'Snags':
            snagsCount++;
            break;
        }
      });
    });

    const passPercentage = totalItems > 0 ? Math.round((passCount / totalItems) * 100) : 0;
    const failPercentage = totalItems > 0 ? Math.round((failCount / totalItems) * 100) : 0;
    const snagsPercentage = totalItems > 0 ? Math.round((snagsCount / totalItems) * 100) : 0;

    return { passCount, failCount, snagsCount, totalItems, passPercentage, failPercentage, snagsPercentage };
  };

  const getPropertyGrade = () => {
    const stats = calculateStats();
    if (stats.passPercentage >= 95 && stats.failPercentage === 0) return 'A+';
    if (stats.passPercentage >= 85) return 'A';
    if (stats.passPercentage >= 75) return 'B';
    if (stats.passPercentage >= 65) return 'C';
    return 'D';
  };

  const stats = calculateStats();
  const grade = getPropertyGrade();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Screen Styles */
        @media screen {
          .minimalist-report-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #ffffff;
            min-height: auto;
            height: auto;
          }
          
          .minimalist-report {
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: visible;
            height: auto;
          }
        }
        
        /* Print Styles */
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .minimalist-report-wrapper {
            height: auto !important;
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          
          .minimalist-report {
            height: auto !important;
            max-height: none !important;
            width: 100% !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            display: block !important;
          }
          
          .content-section {
            page-break-inside: auto !important;
            height: auto !important;
            width: 100% !important;
            display: block !important;
            overflow: visible !important;
          }
          
          .report-header {
            page-break-after: auto !important;
          }
          
          .inspection-table {
            page-break-inside: auto !important;
            width: 100% !important;
            table-layout: fixed !important;
          }
          
          .inspection-table thead {
            display: table-header-group !important;
          }
          
          .inspection-table tbody {
            display: table-row-group !important;
          }
          
          .inspection-table tbody tr {
            page-break-inside: avoid !important;
            display: table-row !important;
          }
          
          .inspection-table td,
          .inspection-table th {
            display: table-cell !important;
          }
          
          .grade-table {
            page-break-inside: avoid !important;
          }
          
          .info-grid {
            page-break-inside: avoid !important;
          }
          
          .grade-display {
            page-break-inside: avoid !important;
          }
          
          .progress-bar {
            page-break-inside: avoid !important;
          }
          
          .area-header {
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          
          .photo-grid {
            page-break-inside: avoid !important;
          }
          
          /* Force page breaks for areas after the second one */
          .area-break {
            page-break-before: always !important;
          }
          
          /* Ensure signature and footer stay together */
          .signature-grid {
            page-break-inside: avoid !important;
          }
          
          .report-footer {
            page-break-inside: avoid !important;
          }
        }
        
        /* Global Styles */
        .minimalist-report {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
          height: auto !important;
          overflow: visible !important;
        }
        
        /* Ensure content flows properly */
        .minimalist-report * {
          box-sizing: border-box;
        }
        
        /* Brand Color - Blue from primary HSL(221 83% 53%) */
        .brand-color {
          color: hsl(221, 83%, 53%);
        }
        
        .brand-bg {
          background-color: hsl(221, 83%, 53%);
        }
        
        .brand-border {
          border-color: hsl(221, 83%, 53%);
        }
        
        /* Header */
        .report-header {
          padding: 40px;
          border-bottom: 3px solid hsl(221, 83%, 53%);
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
        }
        
        .company-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .company-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .company-logo {
          width: 60px;
          height: 60px;
          background: hsl(221, 83%, 53%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .report-title {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }
        
        .report-subtitle {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }
        
        /* Content Sections */
        .content-section {
          padding: 40px;
          border-bottom: 1px solid #e5e7eb;
          min-height: fit-content;
        }
        
        .content-section:last-child {
          border-bottom: none;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: hsl(221, 83%, 53%);
          margin-bottom: 24px;
          padding-bottom: 8px;
          border-bottom: 2px solid hsl(221, 83%, 93%);
        }
        
        /* Property Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: 500;
          color: #1a1a1a;
        }
        
        /* Grade Display */
        .grade-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          background: linear-gradient(135deg, hsl(221, 83%, 98%), hsl(221, 83%, 95%));
          border: 2px solid hsl(221, 83%, 53%);
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .grade-box {
          text-align: center;
        }
        
        .grade-letter {
          font-size: 48px;
          font-weight: 700;
          color: hsl(221, 83%, 53%);
          line-height: 1;
        }
        
        .grade-label {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }
        
        .grade-stats {
          display: flex;
          gap: 40px;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
        
        /* Progress Bar */
        .progress-bar {
          width: 100%;
          height: 32px;
          background: #f3f4f6;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          margin-bottom: 30px;
        }
        
        .progress-segment {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: white;
        }
        
        /* Inspection Table */
        .inspection-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .inspection-table thead {
          background: hsl(221, 83%, 53%);
          color: white;
        }
        
        .inspection-table th {
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .inspection-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: #333;
        }
        
        .inspection-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .inspection-table tbody tr:hover {
          background: #f3f4f6;
        }
        
        /* Status Badges */
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-pass {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status-fail {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .status-snags {
          background: #fed7aa;
          color: #92400e;
        }
        
        /* Grade Classification Table */
        .grade-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid hsl(221, 83%, 53%);
          margin-bottom: 30px;
        }
        
        .grade-table th {
          background: hsl(221, 83%, 53%);
          color: white;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }
        
        .grade-table td {
          padding: 10px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        .grade-row-active {
          background: hsl(221, 83%, 95%);
        }
        
        /* Area Headers */
        .area-header {
          background: hsl(221, 83%, 53%);
          color: white;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 600;
          margin-top: 30px;
          margin-bottom: 0;
        }
        
        /* Photos */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 20px;
        }
        
        .photo-item {
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          aspect-ratio: 4/3;
        }
        
        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Signatures */
        .signature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          padding: 30px 40px;
          background: #f9fafb;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 2px solid #666;
          margin-bottom: 8px;
          height: 50px;
        }
        
        .signature-name {
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .signature-title {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
        
        /* Footer */
        .report-footer {
          padding: 30px 40px;
          background: hsl(221, 83%, 53%);
          color: white;
          text-align: center;
        }
      `}</style>

      {/* Control Buttons */}
      <div className="no-print" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={onBack}
          style={{
            padding: '12px 24px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={handlePrint}
          style={{
            padding: '12px 24px',
            background: 'hsl(221, 83%, 53%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Main Report */}
      <div className="minimalist-report-wrapper">
        <div className="minimalist-report">
          {/* Header */}
          <div className="report-header">
            <div className="company-info">
              <div className="company-brand">
                <div className="company-logo">SP</div>
                <div>
                  <h1 className="report-title">Solution Property</h1>
                  <p className="report-subtitle">Property Inspection Report - Professional Assessment</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="info-label">Report ID</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(221, 83%, 53%)' }}>
                  #{inspection.id.substring(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="content-section">
            <h2 className="section-title">Property Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Client Name</span>
                <span className="info-value">{inspection.clientName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Property Location</span>
                <span className="info-value">{inspection.propertyLocation}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Property Type</span>
                <span className="info-value">{inspection.propertyType}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Inspector</span>
                <span className="info-value">{inspection.inspectorName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Inspection Date</span>
                <span className="info-value">
                  {new Date(inspection.inspectionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Areas Inspected</span>
                <span className="info-value">{inspection.areas.length}</span>
              </div>
            </div>
          </div>

          {/* Inspection Summary */}
          <div className="content-section">
            <h2 className="section-title">Inspection Summary</h2>
            
            {/* Grade Display */}
            <div className="grade-display">
              <div className="grade-box">
                <div className="grade-letter">{grade}</div>
                <div className="grade-label">Property Grade</div>
              </div>
              <div className="grade-stats">
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#10b981' }}>{stats.passCount}</div>
                  <div className="stat-label">Passed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.snagsCount}</div>
                  <div className="stat-label">Snags</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: '#ef4444' }}>{stats.failCount}</div>
                  <div className="stat-label">Failed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.totalItems}</div>
                  <div className="stat-label">Total</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
              {stats.passPercentage > 0 && (
                <div className="progress-segment" style={{ width: `${stats.passPercentage}%`, background: '#10b981' }}>
                  {stats.passPercentage}%
                </div>
              )}
              {stats.snagsPercentage > 0 && (
                <div className="progress-segment" style={{ width: `${stats.snagsPercentage}%`, background: '#f59e0b' }}>
                  {stats.snagsPercentage}%
                </div>
              )}
              {stats.failPercentage > 0 && (
                <div className="progress-segment" style={{ width: `${stats.failPercentage}%`, background: '#ef4444' }}>
                  {stats.failPercentage}%
                </div>
              )}
            </div>
          </div>

          {/* Property Grade Classification */}
          <div className="content-section">
            <h2 className="section-title">Property Grade Classification</h2>
            <table className="grade-table">
              <thead>
                <tr>
                  <th colSpan={3}>تصنيف درجة العقار / Property Grade Classification</th>
                </tr>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ width: '15%', background: '#f3f4f6', color: '#333' }}>Grade</th>
                  <th style={{ width: '35%', background: '#f3f4f6', color: '#333' }}>Description</th>
                  <th style={{ background: '#f3f4f6', color: '#333' }}>الوصف</th>
                </tr>
              </thead>
              <tbody>
                <tr className={grade === 'A+' ? 'grade-row-active' : ''}>
                  <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#10b981' }}>A+</td>
                  <td>Excellent (95%+ Pass, 0% Fail)</td>
                  <td style={{ textAlign: 'right', direction: 'rtl' }}>ممتاز</td>
                </tr>
                <tr className={grade === 'A' ? 'grade-row-active' : ''}>
                  <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#22c55e' }}>A</td>
                  <td>Very Good (85%+ Pass)</td>
                  <td style={{ textAlign: 'right', direction: 'rtl' }}>جيد جداً</td>
                </tr>
                <tr className={grade === 'B' ? 'grade-row-active' : ''}>
                  <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#3b82f6' }}>B</td>
                  <td>Good (75%+ Pass)</td>
                  <td style={{ textAlign: 'right', direction: 'rtl' }}>جيد</td>
                </tr>
                <tr className={grade === 'C' ? 'grade-row-active' : ''}>
                  <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#f59e0b' }}>C</td>
                  <td>Fair (65%+ Pass)</td>
                  <td style={{ textAlign: 'right', direction: 'rtl' }}>مقبول</td>
                </tr>
                <tr className={grade === 'D' ? 'grade-row-active' : ''}>
                  <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#ef4444' }}>D</td>
                  <td>Needs Improvement (&lt;65% Pass)</td>
                  <td style={{ textAlign: 'right', direction: 'rtl' }}>يحتاج تحسين</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Inspection Results */}
          <div className="content-section">
            <h2 className="section-title">Detailed Inspection Results</h2>
            
            {inspection.areas.map((area, areaIndex) => (
              <div key={area.id} className={areaIndex >= 2 ? 'area-break' : ''}>
                <div className="area-header">
                  Area {areaIndex + 1}: {area.name}
                </div>
                
                {area.items.length > 0 ? (
                  <table className="inspection-table">
                    <thead>
                      <tr>
                        <th style={{ width: '5%', textAlign: 'center' }}>#</th>
                        <th style={{ width: '20%' }}>Category</th>
                        <th style={{ width: '25%' }}>Point</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                        <th style={{ width: '15%' }}>Location</th>
                        <th style={{ width: '20%' }}>Comments</th>
                        <th style={{ width: '5%', textAlign: 'center' }}>📷</th>
                      </tr>
                    </thead>
                    <tbody>
                      {area.items.map((item, itemIndex) => (
                        <tr key={item.id}>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{itemIndex + 1}</td>
                          <td>{item.category}</td>
                          <td style={{ fontSize: '13px' }}>{item.point}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`status-badge ${
                              item.status === 'Pass' ? 'status-pass' : 
                              item.status === 'Fail' ? 'status-fail' : 
                              'status-snags'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{item.location || '-'}</td>
                          <td style={{ fontSize: '13px' }}>{item.comments || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            {item.photos.length > 0 ? item.photos.length : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    No inspection points recorded for this area
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Photo Appendix */}
          {(() => {
            const photosExist = inspection.areas.some(area => 
              area.items.some(item => item.photos.length > 0)
            );
            
            if (photosExist) {
              return (
                <div className="content-section area-break">
                  <h2 className="section-title">Photo Documentation</h2>
                  {inspection.areas.map(area => (
                    area.items.filter(item => item.photos.length > 0).map((item, idx) => (
                      <div key={`${area.id}-${item.id}`} className="avoid-break" style={{ marginBottom: '30px' }}>
                        <div style={{ marginBottom: '12px', padding: '8px', background: '#f9fafb', borderLeft: '3px solid hsl(221, 83%, 53%)' }}>
                          <strong>{area.name}</strong> - {item.category}: {item.point}
                        </div>
                        <div className="photo-grid">
                          {item.photos.map((photoId, photoIdx) => {
                            const isBase64 = photoId.startsWith('data:');
                            const isUrl = photoId.startsWith('http://') || photoId.startsWith('https://');
                            const hasPhoto = isBase64 || isUrl || LocalStorageService.getPhoto(photoId);
                            
                            if (!hasPhoto) return null;
                            
                            return (
                              <div key={photoIdx} className="photo-item">
                                <PhotoDisplay photoId={photoId} alt={`Photo ${photoIdx + 1}`} />
                              </div>
                            );
                          }).filter(Boolean)}
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              );
            }
            return null;
          })()}

          {/* Signatures */}
          <div className="signature-grid avoid-break">
            <div className="signature-box">
              <div className="signature-line"></div>
              <div className="signature-name">{inspection.inspectorName}</div>
              <div className="signature-title">Inspector Signature</div>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <div className="signature-name">{inspection.clientName || 'Client Name'}</div>
              <div className="signature-title">Client Signature</div>
            </div>
          </div>

          {/* Footer */}
          <div className="report-footer">
            <div style={{ marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>Solution Property</div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>Professional Property Inspection Services</div>
            <div style={{ fontSize: '12px', marginTop: '16px', opacity: '0.7' }}>
              Report Generated: {new Date().toLocaleString()} | Report ID: {inspection.id}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};