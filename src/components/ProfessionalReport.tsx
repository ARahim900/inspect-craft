import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { PhotoDisplay } from './PhotoDisplay';
import { BilingualDisclaimer } from './BilingualDisclaimer';
import { DISCLAIMER_CONTENT, REPORT_CONFIG, EXECUTIVE_SUMMARY_TEMPLATE } from '@/config/disclaimer';
import type { SavedInspection } from '@/services/storage-service';

interface ProfessionalReportProps {
  inspection: SavedInspection;
  onBack: () => void;
}

const PrintIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const BackIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const ProfessionalReport: React.FC<ProfessionalReportProps> = ({ inspection, onBack }) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Function to calculate property grade based on inspection results
  const calculatePropertyGrade = (inspection: SavedInspection): string => {
    let totalItems = 0;
    let passCount = 0;
    let failCount = 0;
    let snagsCount = 0;

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

    if (totalItems === 0) return 'C';

    const passPercentage = (passCount / totalItems) * 100;
    const failPercentage = (failCount / totalItems) * 100;

    // Grading logic
    if (passPercentage >= 95 && failPercentage === 0) return 'AAA';
    if (passPercentage >= 90 && failPercentage <= 2) return 'AA';
    if (passPercentage >= 80 && failPercentage <= 5) return 'A';
    if (passPercentage >= 70 && failPercentage <= 10) return 'B';
    if (passPercentage >= 60 && failPercentage <= 15) return 'C';
    return 'D';
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to print the report');
        return;
      }

      const printContent = printRef.current.innerHTML;
      const currentDate = new Date().toLocaleDateString();
      
      // Get computed styles from the original element to maintain consistency
      // Enhanced pixel-perfect style extraction
      const computedStyles = window.getComputedStyle(printRef.current);
      const originalFontFamily = computedStyles.fontFamily;
      const originalLineHeight = computedStyles.lineHeight;
      const originalFontSize = computedStyles.fontSize;
      const originalColor = computedStyles.color;
      const originalBackgroundColor = computedStyles.backgroundColor;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Solution Property - Inspection Report - ${inspection.propertyLocation}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
          </style>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: ${originalFontFamily || "'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"};
              line-height: ${originalLineHeight || '1.5'};
              color: ${originalColor || '#333'};
              background: ${originalBackgroundColor || 'white'};
              font-size: ${originalFontSize || '11pt'};
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              box-sizing: border-box;
              min-height: 100vh;
              width: 100%;
              transform: scale(1);
              transform-origin: top left;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 15mm 12mm;
              }
              
              body { 
                margin: 0 !important; 
                padding: 0 !important; 
                font-family: 'Arial', 'Helvetica', sans-serif;
                font-size: 10pt !important;
                line-height: 1.4 !important;
                color: #000 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                box-sizing: border-box;
                background: white !important;
              }
              
              .report-container {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
                background: white !important;
                width: 100% !important;
                max-width: none !important;
                min-height: 100vh !important;
                position: relative !important;
                overflow: visible !important;
                display: block !important;
              }
              
              .no-print { display: none !important; }
              .page-break { 
                page-break-before: always; 
                margin-top: 0 !important; 
                padding-top: 8mm !important; 
              }
              .avoid-break { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
              }
              
              /* Professional section spacing */
              .report-header {
                margin-bottom: 8mm !important;
                padding-bottom: 4mm !important;
                page-break-after: avoid;
              }
              
              .company-logo {
                width: 50px !important;
                height: 50px !important;
                margin-bottom: 6px !important;
              }
              
              .company-name {
                font-size: 16pt !important;
                margin-bottom: 3px !important;
              }
              
              .report-title {
                font-size: 14pt !important;
                margin-bottom: 3px !important;
              }
              
              .report-subtitle {
                font-size: 10pt !important;
              }
              
              .property-info {
                margin-bottom: 6mm !important;
                padding: 4mm !important;
                page-break-inside: avoid;
                grid-template-columns: 1fr 1fr;
                gap: 8px !important;
              }
              
              .property-info .info-item {
                margin-bottom: 4px !important;
                font-size: 9pt !important;
              }
              
              .property-info .info-label {
                min-width: 80px !important;
                font-size: 9pt !important;
              }
              
              .bilingual-disclaimer-section {
                margin-bottom: 8mm !important;
                page-break-inside: avoid;
              }
              
              .area-section {
                margin-bottom: 6mm !important;
                page-break-inside: avoid;
              }
              
              .area-header {
                font-size: 12pt !important;
                padding: 8px !important;
                margin-bottom: 0 !important;
              }
              
              .signatures {
                margin: 8mm 0 !important;
                padding: 4mm !important;
                page-break-inside: avoid;
              }
              
              .disclaimer {
                margin: 6mm 0 !important;
                padding: 4mm !important;
                page-break-inside: avoid;
                font-size: 8pt !important;
              }
              
              .disclaimer h3 {
                font-size: 10pt !important;
                margin-bottom: 8px !important;
              }
              
              .report-footer {
                margin-top: 8mm !important;
                padding-top: 4mm !important;
                page-break-inside: avoid;
                font-size: 8pt !important;
              }
              
              .footer-logo {
                width: 40px !important;
                height: 40px !important;
                margin-bottom: 6px !important;
              }
              
              /* Enhanced Table improvements */
              .inspection-table {
                margin-bottom: 4mm !important;
                width: 100% !important;
                table-layout: fixed !important;
                page-break-inside: auto !important;
              }
              
              .inspection-table th {
                padding: 2mm !important;
                font-size: 9pt !important;
                background-color: #f5f5f5 !important;
                -webkit-print-color-adjust: exact;
              }
              
              .inspection-table td {
                padding: 2mm !important;
                font-size: 8pt !important;
                line-height: 1.3 !important;
                word-wrap: break-word !important;
              }
              
              .inspection-table tr {
                page-break-inside: avoid !important;
              }
              
            /* Enhanced Photo Grid for Inspection Tables */
            .photo-grid {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 2mm !important;
                margin-top: 2mm !important;
                width: 100% !important;
            }
            
            .photo-item {
                width: 100% !important;
                max-width: 65mm !important;
                height: 48mm !important;
                object-fit: cover !important;
                border: 0.5pt solid #ddd !important;
                border-radius: 2mm !important;
                page-break-inside: avoid !important;
                display: block !important;
            }
            
            .photo-caption {
                font-size: 7pt !important;
                margin-top: 1mm !important;
                text-align: center !important;
                color: #666 !important;
            }

            /* Fix inspection table column widths */
            .inspection-table {
                table-layout: fixed !important;
                width: 100% !important;
            }
            
            .inspection-table th:nth-child(1),
            .inspection-table td:nth-child(1) {
                width: 30% !important;
            }
            
            .inspection-table th:nth-child(2),
            .inspection-table td:nth-child(2) {
                width: 10% !important;
                text-align: center !important;
            }
            
            .inspection-table th:nth-child(3),
            .inspection-table td:nth-child(3) {
                width: 30% !important;
            }
            
            .inspection-table th:nth-child(4),
            .inspection-table td:nth-child(4) {
                width: 30% !important;
            }
              
              /* Text spacing optimization */
              p {
                margin-bottom: 2mm !important;
                text-align: justify !important;
                orphans: 3 !important;
                widows: 3 !important;
              }
              
              /* Enhanced headings */
              h1, h2, h3, h4 {
                page-break-after: avoid !important;
                margin-bottom: 2mm !important;
                margin-top: 4mm !important;
                orphans: 3 !important;
                widows: 3 !important;
              }
              
              /* Enhanced signature section */
              .signature-block {
                text-align: center !important;
              }
              
              .signature-line {
                height: 30px !important;
                margin-bottom: 4px !important;
                border-bottom-width: 1pt !important;
              }
              
              .signature-label {
                font-size: 8pt !important;
              }
              
              .signature-date {
                font-size: 7pt !important;
                margin-top: 2px !important;
              }
              
              /* Status colors for print */
              .status-pass { 
                color: #000 !important; 
                background-color: #e8f5e8 !important;
                font-weight: bold !important;
                -webkit-print-color-adjust: exact;
              }
              
              .status-fail { 
                color: #000 !important; 
                background-color: #ffe8e8 !important;
                font-weight: bold !important;
                -webkit-print-color-adjust: exact;
              }
              
              .status-snags { 
                color: #000 !important; 
                background-color: #fff3cd !important;
                font-weight: bold !important;
                -webkit-print-color-adjust: exact;
              }
              
              /* Bilingual table enhancements */
              .bilingual-disclaimer-section table {
                page-break-inside: avoid !important;
                margin-bottom: 4mm !important;
              }
              
              .bilingual-disclaimer-section td {
                padding: 3mm !important;
                font-size: 8pt !important;
              }
              
              .bilingual-disclaimer-section th {
                padding: 2mm !important;
                font-size: 9pt !important;
              }
              
              /* Watermark for print */
              .watermark {
                font-size: 48pt !important;
                opacity: 0.03 !important;
              }
            }
            
            /* Header Styles */
            .report-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #1e40af;
              position: relative;
            }
            
            .company-logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 15px;
              display: block;
            }
            
            .company-name {
              font-size: 24pt;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            
            .report-title {
              font-size: 18pt;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            
            .report-subtitle {
              font-size: 12pt;
              color: #666;
              font-style: italic;
            }
            
            /* Property Information Box */
            .property-info {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            
            .property-info .info-item {
              margin-bottom: 8px;
            }
            
            .property-info .info-label {
              font-weight: bold;
              color: #1e40af;
              display: inline-block;
              min-width: 120px;
            }
            
            .property-info .info-value {
              color: #333;
            }
            
            /* Introduction Section */
            .introduction {
              background: #eff6ff;
              border-left: 5px solid #3b82f6;
              padding: 20px;
              margin-bottom: 25px;
            }
            
            .introduction h3 {
              font-size: 14pt;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 15px;
              text-align: center;
            }
            
            .introduction p {
              margin-bottom: 12px;
              text-align: justify;
            }
            
            /* Area Sections */
            .area-section {
              margin-bottom: 30px;
            }
            
            .area-header {
              background: #1e40af;
              color: white;
              padding: 15px;
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 0;
            }
            
            .inspection-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            .inspection-table th,
            .inspection-table td {
              border: 1px solid #d1d5db;
              padding: 12px 8px;
              vertical-align: top;
              text-align: left;
            }
            
            .inspection-table th {
              background: #f3f4f6;
              font-weight: bold;
              font-size: 10pt;
              text-align: center;
            }
            
            .inspection-table td {
              font-size: 10pt;
            }
            
            .status-pass { 
              color: #16a34a !important; 
              font-weight: bold;
              text-align: center;
            }
            
            .status-fail { 
              color: #dc2626 !important; 
              font-weight: bold;
              text-align: center;
            }
            
            .status-snags { 
              color: #ea580c !important; 
              font-weight: bold;
              text-align: center;
            }
            
            /* Photo Grid */
            .photo-section {
              margin-top: 15px;
            }
            
            .photo-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
              margin-top: 10px;
            }
            
            .photo-item {
              width: 150px !important;
              height: 110px !important;
              object-fit: cover;
              border: 2px solid #e5e7eb;
              border-radius: 6px;
              page-break-inside: avoid;
            }
            
            .photo-caption {
              font-size: 9pt;
              text-align: center;
              color: #666;
              margin-top: 5px;
              font-style: italic;
            }
            
            /* Signature Section */
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin: 40px 0;
              padding: 20px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              background: #fafafa;
            }
            
            .signature-block {
              text-align: center;
            }
            
            .signature-line {
              border-bottom: 2px solid #333;
              margin-bottom: 8px;
              height: 50px;
            }
            
            .signature-label {
              font-weight: bold;
              font-size: 10pt;
              color: #333;
            }
            
            .signature-date {
              font-size: 9pt;
              color: #666;
              margin-top: 5px;
            }
            
            /* Disclaimer Section */
            .disclaimer {
              background: #fef7cd;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
              font-size: 9pt;
              line-height: 1.5;
            }
            
            .disclaimer h3 {
              font-size: 12pt;
              font-weight: bold;
              color: #92400e;
              margin-bottom: 15px;
              text-align: center;
              text-transform: uppercase;
            }
            
            .disclaimer p {
              margin-bottom: 10px;
              text-align: justify;
            }
            
            .disclaimer ul {
              margin-left: 20px;
              margin-bottom: 10px;
            }
            
            .disclaimer li {
              margin-bottom: 5px;
            }
            
            /* Footer */
            .report-footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              font-size: 9pt;
              color: #666;
            }
            
            .footer-logo {
              width: 60px;
              height: 60px;
              margin: 0 auto 10px;
              opacity: 0.7;
            }
            
            /* Watermark */
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72pt;
              color: rgba(59, 130, 246, 0.1);
              font-weight: bold;
              z-index: -1;
              pointer-events: none;
            }
            
            /* Force print margins - Browser compatibility */
            @media print {
              html {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              body {
                margin: 0 !important;
                padding: 15mm !important;
                width: auto !important;
                min-height: auto !important;
                box-sizing: border-box !important;
                background: white !important;
              }
              
              .print-wrapper {
                margin: 0 auto !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 180mm !important;
                box-sizing: border-box !important;
              }
              
              /* Override browser default margins */
              @page {
                size: A4 !important;
                margin: 15mm !important;
              }
              
              /* CRITICAL: Ensure content fits within printable area and matches display */
              * {
                max-width: 100% !important;
                box-sizing: border-box !important;
                overflow: visible !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
              }
              
              /* Safe content positioning - matches display layout */
              .report-container, .print-wrapper {
                margin: 0 auto !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 190mm !important;
                font-size: inherit !important;
              }
              
              /* Preserve original spacing and layout */
              .space-y-6 > * + * {
                margin-top: 1.5rem !important;
              }
              
              .space-y-4 > * + * {
                margin-top: 1rem !important;
              }
              
              .space-y-3 > * + * {
                margin-top: 0.75rem !important;
              }
              
              /* Fix table layouts - maintain display consistency */
              table {
                width: 100% !important;
                table-layout: auto !important;
                border-collapse: collapse !important;
                margin: 0.5rem 0 !important;
                font-size: inherit !important;
              }
              
              td, th {
                word-wrap: break-word !important;
                word-break: normal !important;
                overflow: visible !important;
                font-size: 9pt !important;
                padding: 4px 6px !important;
                vertical-align: top !important;
              }
              
              /* Status indicators maintain colors */
              .bg-green-100, .text-green-800 {
                background-color: #dcfce7 !important;
                color: #166534 !important;
              }
              
              .bg-red-100, .text-red-800 {
                background-color: #fef2f2 !important;
                color: #991b1b !important;
              }
              
              .bg-yellow-100, .text-yellow-800 {
                background-color: #fefce8 !important;
                color: #854d0e !important;
              }
              
              /* Bilingual table fixes */
              .bilingual-disclaimer-section td:first-child,
              .bilingual-disclaimer-section th:first-child {
                width: 48% !important;
                text-align: left !important;
              }
              
              .bilingual-disclaimer-section td:last-child,
              .bilingual-disclaimer-section th:last-child {
                width: 48% !important;
                text-align: right !important;
                direction: rtl !important;
              }
            }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.onafterprint = () => window.close(); }, 500);">
          <div class="watermark">SOLUTION PROPERTY</div>
          <div class="print-wrapper" style="margin: 0; padding: 0; max-width: 190mm;">
            ${printContent}
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    }
  };

  const currentDate = new Date().toLocaleDateString();
  const reportDate = inspection.inspectionDate || currentDate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
        >
          <BackIcon />
          Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md"
          >
            <PrintIcon />
            Print Professional Report
          </button>
        </div>
      </div>

      <div ref={printRef} className="report-container bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <header className="report-header">
          <img 
            src="/logo.jpeg" 
            alt="Solution Property Logo" 
            className="company-logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="company-name">Solution Property</div>
          <div className="report-title">Property Inspection Report</div>
          <div className="report-subtitle">Professional Assessment Document</div>
        </header>

        {/* Property Information */}
        <section className="property-info">
          <div className="info-item">
            <span className="info-label">Client Name:</span>
            <span className="info-value">{inspection.clientName || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Inspector:</span>
            <span className="info-value">{inspection.inspectorName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Property Location:</span>
            <span className="info-value">{inspection.propertyLocation}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Report Date:</span>
            <span className="info-value">{new Date(reportDate).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Property Type:</span>
            <span className="info-value">{inspection.propertyType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Inspection Date:</span>
            <span className="info-value">{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
          </div>
        </section>

        {/* Bilingual Disclaimer Section */}
        <BilingualDisclaimer
          clientName={inspection.clientName || 'Valued Client'}
          propertyLocation={inspection.propertyLocation}
          inspectionDate={inspection.inspectionDate}
          inspectorName={inspection.inspectorName}
          propertyGrade={calculatePropertyGrade(inspection)}
        />

        {/* Inspection Areas */}
        <main className="inspection-areas">
          {inspection.areas.map((area, areaIndex) => (
            <section key={area.id} className={`area-section ${areaIndex > 0 ? 'page-break' : ''}`}>
              <h2 className="area-header">
                {area.name}
              </h2>
              
              {area.items.length > 0 ? (
                <table className="inspection-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Inspection Point</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '28%' }}>Comments & Location</th>
                      <th style={{ width: '25%' }}>Photographic Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.category}</strong><br />
                          {item.point}
                        </td>
                        <td className={cn(
                          item.status === 'Pass' && "status-pass",
                          item.status === 'Fail' && "status-fail",
                          item.status === 'Snags' && "status-snags"
                        )}>
                          {item.status}
                        </td>
                        <td>
                          {item.comments && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Comments:</strong><br />
                              {item.comments}
                            </div>
                          )}
                          {item.location && (
                            <div>
                              <strong>Location:</strong><br />
                              {item.location}
                            </div>
                          )}
                        </td>
                        <td>
                          {item.photos.length > 0 ? (
                            <div className="photo-section">
                              <div className="photo-grid">
                                {item.photos.slice(0, 2).map((photoId, idx) => (
                                  <div key={idx}>
                                    <PhotoDisplay
                                      photoId={photoId}
                                      className="photo-item"
                                      alt={`${item.point} - Photo ${idx + 1}`}
                                    />
                                    <div className="photo-caption">
                                      Photo {idx + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {item.photos.length > 2 && (
                                <p style={{ fontSize: '9pt', fontStyle: 'italic', marginTop: '10px' }}>
                                  + {item.photos.length - 2} additional photo(s)
                                </p>
                              )}
                            </div>
                          ) : (
                            <em style={{ color: '#666', fontSize: '9pt' }}>No photos</em>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px', fontStyle: 'italic', color: '#666' }}>
                  No inspection points recorded for this area.
                </div>
              )}
            </section>
          ))}
        </main>

        {/* Signature Section */}
        <section className="signatures avoid-break">
          <div className="signature-block">
            <div className="signature-line"></div>
            <div className="signature-label">Inspector Signature</div>
            <div className="signature-date">{inspection.inspectorName}</div>
            <div className="signature-date">Date: {new Date(reportDate).toLocaleDateString()}</div>
          </div>
          <div className="signature-block">
            <div className="signature-line"></div>
            <div className="signature-label">Client Signature</div>
            <div className="signature-date">{inspection.clientName || 'Client Name'}</div>
            <div className="signature-date">Date: _________________</div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="disclaimer avoid-break">
          <h3>{DISCLAIMER_CONTENT.title}</h3>
          
          {DISCLAIMER_CONTENT.sections.map((section, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <p><strong>{section.title}:</strong></p>
              {section.content && (
                <p>{section.content}</p>
              )}
              {section.items && (
                <ul>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          
          <p style={{ marginTop: '15px', fontSize: '10pt', textAlign: 'center' }}>
            <strong>{DISCLAIMER_CONTENT.footer}</strong>
          </p>
        </section>

        {/* Footer */}
        <footer className="report-footer">
          <img 
            src="/logo.jpeg" 
            alt="Solution Property Logo" 
            className="footer-logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <p><strong>Solution Property</strong> - Professional Property Inspection Services</p>
          <p>Report generated on {currentDate} | Document ID: {inspection.id}</p>
        </footer>
      </div>
    </div>
  );
};