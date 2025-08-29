import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { SavedInspection } from './storage-service';

export interface PDFGenerationOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export class PDFGenerationService {
  private static readonly DEFAULT_OPTIONS: PDFGenerationOptions = {
    filename: 'property-inspection-report.pdf',
    quality: 1.0,
    format: 'a4',
    orientation: 'portrait',
    margins: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    }
  };

  /**
   * Generate PDF from HTML element
   */
  static async generatePDFFromElement(
    element: HTMLElement,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<jsPDF> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: config.format
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - config.margins!.left - config.margins!.right;
    const contentHeight = pageHeight - config.margins!.top - config.margins!.bottom;

    // Prepare element for capture
    const originalStyle = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      width: element.style.width,
      height: element.style.height,
      overflow: element.style.overflow,
      transform: element.style.transform
    };

    // Set element styles for optimal PDF capture
    element.style.position = 'absolute';
    element.style.left = '0';
    element.style.top = '0';
    element.style.width = `${contentWidth * 3.78}px`; // Convert mm to px (approximate)
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.transform = 'scale(1)';

    try {
      // Capture element as canvas
      const canvas = await html2canvas(element, {
        scale: config.quality,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: contentWidth * 3.78,
        height: undefined, // Let it calculate based on content
        scrollX: 0,
        scrollY: 0,
        windowWidth: contentWidth * 3.78,
        windowHeight: window.innerHeight
      });

      // Calculate scaling to fit PDF page
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Handle multi-page content
      let yPosition = 0;
      let pageCount = 0;

      while (yPosition < imgHeight) {
        if (pageCount > 0) {
          pdf.addPage();
        }

        // Calculate the portion of image to include on this page
        const sourceY = (yPosition * canvas.width) / imgWidth;
        const sourceHeight = Math.min(
          (contentHeight * canvas.width) / imgWidth,
          canvas.height - sourceY
        );

        // Create a temporary canvas for this page portion
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d')!;
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        // Draw the portion of the original canvas
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );

        // Add to PDF
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
        
        pdf.addImage(
          pageImgData,
          'JPEG',
          config.margins!.left,
          config.margins!.top,
          imgWidth,
          pageImgHeight
        );

        yPosition += contentHeight;
        pageCount++;

        // Safety break to prevent infinite loops
        if (pageCount > 50) {
          console.warn('PDF generation stopped at 50 pages to prevent infinite loop');
          break;
        }
      }

    } finally {
      // Restore original element styles
      Object.assign(element.style, originalStyle);
    }

    return pdf;
  }

  /**
   * Generate and download PDF for inspection report
   */
  static async generateInspectionReportPDF(
    inspection: SavedInspection,
    element: HTMLElement,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<void> {
    const filename = options.filename || `inspection-report-${inspection.id}.pdf`;
    
    try {
      console.log('🔄 Generating PDF for inspection:', inspection.id);
      
      const pdf = await this.generatePDFFromElement(element, {
        ...options,
        filename
      });

      // Add metadata
      pdf.setProperties({
        title: `Property Inspection Report - ${inspection.propertyLocation}`,
        subject: 'Property Inspection Report',
        author: inspection.inspectorName,
        creator: 'Solution Property Inspection System',
        keywords: 'property, inspection, report, professional'
      });

      // Download the PDF
      pdf.save(filename);
      
      console.log('✅ PDF generated successfully:', filename);
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF with page-by-page approach for better quality
   */
  static async generatePageByPagePDF(
    inspection: SavedInspection,
    pageElements: HTMLElement[],
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<void> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const filename = config.filename || `inspection-report-${inspection.id}.pdf`;
    
    try {
      console.log('🔄 Generating page-by-page PDF for inspection:', inspection.id);
      
      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: 'mm',
        format: config.format
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - config.margins!.left - config.margins!.right;

      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i];
        
        if (i > 0) {
          pdf.addPage();
        }

        // Capture page as canvas
        const canvas = await html2canvas(pageElement, {
          scale: config.quality,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: contentWidth * 3.78,
          scrollX: 0,
          scrollY: 0
        });

        // Add to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Scale to fit page if necessary
        const maxHeight = pageHeight - config.margins!.top - config.margins!.bottom;
        const finalHeight = Math.min(imgHeight, maxHeight);
        const finalWidth = imgHeight > maxHeight ? (canvas.width * maxHeight) / canvas.height : imgWidth;
        
        pdf.addImage(
          imgData,
          'JPEG',
          config.margins!.left,
          config.margins!.top,
          finalWidth,
          finalHeight
        );
      }

      // Add metadata
      pdf.setProperties({
        title: `Property Inspection Report - ${inspection.propertyLocation}`,
        subject: 'Property Inspection Report',
        author: inspection.inspectorName,
        creator: 'Solution Property Inspection System',
        keywords: 'property, inspection, report, professional'
      });

      // Download the PDF
      pdf.save(filename);
      
      console.log('✅ Page-by-page PDF generated successfully:', filename);
    } catch (error) {
      console.error('❌ Page-by-page PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preview PDF in new window before download
   */
  static async previewPDF(
    inspection: SavedInspection,
    element: HTMLElement,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<void> {
    try {
      const pdf = await this.generatePDFFromElement(element, options);
      
      // Open PDF in new window
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const previewWindow = window.open(pdfUrl, '_blank');
      if (!previewWindow) {
        throw new Error('Failed to open PDF preview. Please allow popups for this site.');
      }
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60000);
      
    } catch (error) {
      console.error('❌ PDF preview failed:', error);
      throw error;
    }
  }
}