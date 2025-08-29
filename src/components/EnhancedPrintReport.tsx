import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { BilingualDisclaimer } from './BilingualDisclaimer';
import { ProfessionalHeader } from './ProfessionalHeader';
import { ProfessionalFooter } from './ProfessionalFooter';
import { EnhancedTable } from './EnhancedTable';
import { ProfessionalPhotoContainer } from './ProfessionalPhotoContainer';
import { HierarchicalSection, ContentGroup, HighlightBox } from './HierarchicalSection';
import { usePrintPagination } from '@/hooks/usePrintPagination';
import { PDFGenerationService } from '@/services/pdf-generation-service';
import { DISCLAIMER_CONTENT } from '@/config/disclaimer';
import type { SavedInspection } from '@/services/storage-service';
import '../styles/print-styles.css';

interface EnhancedPrintReportProps {
  inspection: SavedInspection;
  onBack: () => void;
}

const PrintIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const PDFIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const BackIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const EnhancedPrintReport: React.FC<EnhancedPrintReportProps> = ({ inspection, onBack }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const pagination = usePrintPagination(printRef);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Debug function to check print content
  const debugPrintContent = () => {
    const printContainer = printRef.current;
    if (printContainer) {
      console.log('Print container dimensions:', {
        height: printContainer.scrollHeight,
        width: printContainer.scrollWidth,
        sections: printContainer.querySelectorAll('.area-section').length,
        tables: printContainer.querySelectorAll('.inspection-table').length
      });
    }
  };

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

    if (passPercentage >= 95 && failPercentage === 0) return 'AAA';
    if (passPercentage >= 90 && failPercentage <= 2) return 'AA';
    if (passPercentage >= 80 && failPercentage <= 5) return 'A';
    if (passPercentage >= 70 && failPercentage <= 10) return 'B';
    if (passPercentage >= 60 && failPercentage <= 15) return 'C';
    return 'D';
  };

  const getInspectionSummary = (inspection: SavedInspection) => {
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

    return {
      total: totalItems,
      pass: passCount,
      fail: failCount,
      snags: snagsCount,
      passPercentage: totalItems > 0 ? ((passCount / totalItems) * 100).toFixed(1) : '0'
    };
  };

  const handlePrint = async () => {
    try {
      // Ensure all content is visible and properly formatted for printing
      const printContainer = printRef.current;
      if (printContainer) {
        // Force layout recalculation to ensure all content is rendered
        printContainer.style.display = 'block';
        printContainer.style.visibility = 'visible';
        printContainer.style.height = 'auto';
        printContainer.style.overflow = 'visible';

        // Ensure all images are loaded before printing
        const images = printContainer.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true); // Continue even if image fails
              // Timeout after 2 seconds
              setTimeout(() => resolve(true), 2000);
            }
          });
        });

        // Wait for all images to load or timeout
        await Promise.all(imagePromises);

        // Add a small delay to ensure layout is complete
        setTimeout(() => {
          // Use the browser's print dialog which handles multi-page printing
          window.print();
        }, 200);
      } else {
        // Fallback if ref is not available
        window.print();
      }
    } catch (error) {
      console.warn('Print preparation failed, using fallback:', error);
      // Fallback to simple print
      window.print();
    }
  };

  const handleGeneratePDF = async () => {
    if (!printRef.current) {
      setPdfError('Report content not available for PDF generation');
      return;
    }

    setIsGeneratingPDF(true);
    setPdfError(null);

    try {
      // Ensure all images are loaded before PDF generation
      const images = printRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
            setTimeout(() => resolve(true), 3000);
          }
        });
      });

      await Promise.all(imagePromises);

      // Generate PDF
      await PDFGenerationService.generateInspectionReportPDF(
        inspection,
        printRef.current,
        {
          filename: `inspection-report-${inspection.propertyLocation.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
          quality: 1.0,
          format: 'a4',
          orientation: 'portrait'
        }
      );

    } catch (error) {
      console.error('PDF generation failed:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!printRef.current) {
      setPdfError('Report content not available for PDF preview');
      return;
    }

    setIsGeneratingPDF(true);
    setPdfError(null);

    try {
      // Ensure all images are loaded before PDF generation
      const images = printRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
            setTimeout(() => resolve(true), 3000);
          }
        });
      });

      await Promise.all(imagePromises);

      // Preview PDF
      await PDFGenerationService.previewPDF(
        inspection,
        printRef.current,
        {
          quality: 0.8, // Lower quality for faster preview
          format: 'a4',
          orientation: 'portrait'
        }
      );

    } catch (error) {
      console.error('PDF preview failed:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to preview PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const currentDate = new Date().toLocaleDateString();
  const reportDate = inspection.inspectionDate || currentDate;
  const summary = getInspectionSummary(inspection);
  const propertyGrade = calculatePropertyGrade(inspection);

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
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={debugPrintContent}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
            title="Debug print content (check console)"
          >
            Debug
          </button>
          <button
            onClick={handlePreviewPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            title="Preview PDF in new window"
          >
            <EyeIcon />
            {isGeneratingPDF ? 'Generating...' : 'Preview PDF'}
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
            title="Download PDF report"
          >
            <PDFIcon />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md"
            title="Print using browser"
          >
            <PrintIcon />
            Print Report
          </button>
        </div>
      </div>

      {/* PDF Error Display */}
      {pdfError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 no-print">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-medium">PDF Generation Error</span>
          </div>
          <p className="text-red-700 mt-2">{pdfError}</p>
          <button
            onClick={() => setPdfError(null)}
            className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div ref={printRef} className="print-container report-container professional-design-system bg-white rounded-xl shadow-sm">
        <div className="watermark">SOLUTION PROPERTY</div>
        
        {/* Professional Header - appears on every page */}
        <ProfessionalHeader
          companyName="Solution Property"
          reportTitle="Property Inspection Report"
          pageNumber={pagination.currentPage}
          totalPages={pagination.totalPages}
          reportId={inspection.id}
          inspectionDate={inspection.inspectionDate}
        />
        
        {/* Professional Footer - appears on every page */}
        <ProfessionalFooter
          companyName="Solution Property"
          reportId={inspection.id}
          generatedDate={currentDate}
          pageNumber={pagination.currentPage}
          totalPages={pagination.totalPages}
          inspectorName={inspection.inspectorName}
          propertyLocation={inspection.propertyLocation}
        />

        {/* Page 1: Title, Property Info, Executive Summary */}
        <div className="report-page">
          {/* Professional Header */}
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

          {/* Visual Continuity Line */}
          <div className="visual-continuity-line"></div>
          
          {/* Property Information with Enhanced Hierarchy */}
          <HierarchicalSection 
            level={2} 
            title="Property Information"
            showAttentionGuide={true}
            className="property-info-section"
          >
            <ContentGroup type="primary">
              <EnhancedTable
                headers={['Property Details', 'Value', 'Inspection Details', 'Value']}
                rows={[
                  {
                    id: 'property-info-1',
                    cells: [
                      'Client Name',
                      inspection.clientName || 'N/A',
                      'Inspector',
                      inspection.inspectorName
                    ]
                  },
                  {
                    id: 'property-info-2',
                    cells: [
                      'Property Location',
                      inspection.propertyLocation,
                      'Inspection Date',
                      new Date(inspection.inspectionDate).toLocaleDateString()
                    ]
                  },
                  {
                    id: 'property-info-3',
                    cells: [
                      'Property Type',
                      inspection.propertyType,
                      'Report Date',
                      new Date(reportDate).toLocaleDateString()
                    ]
                  }
                ]}
                columnWidths={['25%', '25%', '25%', '25%']}
                className="property-information-table"
              />
            </ContentGroup>
          </HierarchicalSection>

          {/* Section Divider */}
          <div className="section-divider"></div>
          
          {/* Executive Summary with Enhanced Hierarchy */}
          <HierarchicalSection 
            level={2} 
            title="Executive Summary"
            showAttentionGuide={true}
            showVisualFlow={true}
            className="executive-summary-section"
          >
            <ContentGroup type="primary">
              <p className="reading-flow-indicator">
                This comprehensive property inspection was conducted on {new Date(inspection.inspectionDate).toLocaleDateString()}
                at {inspection.propertyLocation}. The assessment covered {inspection.areas.length} distinct areas
                with a total of {summary.total} inspection points evaluated.
              </p>
            </ContentGroup>

            <ContentGroup type="info-dense" useMultiColumn={true} columnCount={2}>
              <div className="column-content-primary">
                <EnhancedTable
                  headers={['Inspection Results', 'Count', 'Percentage']}
                  rows={[
                    {
                      id: 'summary-pass',
                      cells: ['Passed Items', summary.pass.toString(), `${summary.passPercentage}%`]
                    },
                    {
                      id: 'summary-fail',
                      cells: ['Failed Items', summary.fail.toString(), `${((summary.fail / summary.total) * 100).toFixed(1)}%`]
                    },
                    {
                      id: 'summary-snags',
                      cells: ['Items with Snags', summary.snags.toString(), `${((summary.snags / summary.total) * 100).toFixed(1)}%`]
                    }
                  ]}
                  columnWidths={['50%', '25%', '25%']}
                  className="summary-results-table"
                />
              </div>
              
              <div className="column-content-secondary">
                <HierarchicalSection level={4} title="Property Grade">
                  <HighlightBox type="primary">
                    <div style={{ 
                      textAlign: 'center', 
                      fontSize: '16pt', 
                      fontWeight: 'bold',
                      color: propertyGrade === 'D' ? '#d97706' : '#059669',
                      backgroundColor: propertyGrade === 'D' ? '#fef3c7' : '#dcfce7',
                      padding: '8mm',
                      borderRadius: '2mm'
                    }}>
                      Grade: {propertyGrade}
                    </div>
                  </HighlightBox>
                </HierarchicalSection>
              </div>
            </ContentGroup>
          </HierarchicalSection>

          {/* Section Divider */}
          <div className="section-divider"></div>
          
          {/* Bilingual Disclaimer */}
          <div className="bilingual-disclaimer first-page-content">
            <BilingualDisclaimer
              clientName={inspection.clientName || 'Valued Client'}
              propertyLocation={inspection.propertyLocation}
              inspectionDate={inspection.inspectionDate}
              inspectorName={inspection.inspectorName}
              propertyGrade={propertyGrade}
            />
          </div>
        </div>

        {/* Pages 2+: Inspection Areas - Each area gets its own page or shares based on content */}
        {inspection.areas.map((area, areaIndex) => (
          <div key={area.id} className="report-page">
            <div className="visual-continuity-line"></div>
            
            <HierarchicalSection
              level={2}
              title={area.name}
              showAttentionGuide={true}
              className="area-section"
            >
              <div className="page-continuation-marker"></div>
              
              <ContentGroup type="primary">
                {/* Individual findings with break-inside: avoid */}
                {area.items.map((item, itemIndex) => (
                  <div key={item.id} className="finding">
                    <EnhancedTable
                      headers={['Inspection Point', 'Grade', 'Comments', 'Evidence']}
                      rows={[{
                        id: item.id.toString(),
                        cells: [
                          `${item.category}: ${item.point}`,
                          item.status,
                          item.comments || 'No comments',
                          item.photos.length > 0 ? (
                            <ProfessionalPhotoContainer
                              photos={item.photos}
                              maxPhotos={2}
                              size="small"
                              layout="inline"
                              showCaptions={false}
                              context={`${item.category} Evidence`}
                            />
                          ) : 'No photos'
                        ],
                        grade: item.status === 'Fail' ? 'D' : undefined,
                        className: item.status === 'Fail' ? 'grade-highlight-d' : undefined
                      }]}
                      gradeColumn={1}
                      columnWidths={['35%', '12%', '28%', '25%']}
                      className="professional-inspection-table finding-table"
                      showHeaders={itemIndex === 0} // Only show headers for first item in area
                    />
                  </div>
                ))}
              </ContentGroup>
            </HierarchicalSection>
          </div>
        ))}

        {/* Final Page: Signatures and Disclaimer */}
        <div className="report-page">
          <div className="visual-continuity-line"></div>
          
          {/* Signatures Section with Hierarchical Layout */}
          <HierarchicalSection 
            level={2} 
            title="Signatures"
            className="signatures-section avoid-break"
          >
            <ContentGroup type="secondary">
              <EnhancedTable
                headers={['Inspector Signature', 'Client Signature']}
                rows={[
                  {
                    id: 'signature-names',
                    cells: [
                      inspection.inspectorName,
                      inspection.clientName || 'Client Name'
                    ]
                  },
                  {
                    id: 'signature-dates',
                    cells: [
                      `Date: ${new Date(reportDate).toLocaleDateString()}`,
                      'Date: _________________'
                    ]
                  },
                  {
                    id: 'signature-lines',
                    cells: [
                      <div key="sig1" style={{ borderBottom: '1pt solid #000', height: '15mm', marginTop: '5mm' }}></div>,
                      <div key="sig2" style={{ borderBottom: '1pt solid #000', height: '15mm', marginTop: '5mm' }}></div>
                    ]
                  }
                ]}
                columnWidths={['50%', '50%']}
                className="signatures-table"
              />
            </ContentGroup>
          </HierarchicalSection>

          {/* Section Divider */}
          <div className="section-divider"></div>

          {/* Professional Disclaimer with Enhanced Hierarchy */}
          <HierarchicalSection 
            level={2} 
            title={DISCLAIMER_CONTENT.title}
            showAttentionGuide={true}
            className="disclaimer-section avoid-break"
          >
            <ContentGroup type="primary">
              {DISCLAIMER_CONTENT.sections.map((section, index) => (
                <HierarchicalSection
                  key={index}
                  level={3}
                  title={section.title}
                  className="disclaimer-subsection"
                >
                  {section.content && (
                    <p className="whitespace-small">{section.content}</p>
                  )}
                  {section.items && (
                    <ul className="hierarchy-level-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  )}
                </HierarchicalSection>
              ))}
              
              <HighlightBox type="important">
                <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {DISCLAIMER_CONTENT.footer}
                </p>
              </HighlightBox>
            </ContentGroup>
          </HierarchicalSection>

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
            <p>Report ID: {inspection.id} | Generated: {currentDate}</p>
            <p style={{ fontSize: '7pt', marginTop: '5px' }}>
              This document is confidential and proprietary. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};