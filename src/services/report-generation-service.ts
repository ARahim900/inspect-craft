import type { SavedInspection } from './storage-service';

export interface ReportGenerationOptions {
  format: 'pdf' | 'excel' | 'html' | 'docx';
  template: 'standard' | 'detailed' | 'summary';
  includePhotos: boolean;
  language: 'en' | 'ar' | 'bilingual';
}

export interface ReportGenerator {
  generateReport(inspection: SavedInspection, options: ReportGenerationOptions): Promise<Blob>;
  getPreview(inspection: SavedInspection, options: ReportGenerationOptions): Promise<string>;
  getSupportedFormats(): string[];
}

// Factory pattern for different report generators
export class ReportGenerationService {
  private generators: Map<string, ReportGenerator> = new Map();

  constructor() {
    // Register different generators
    this.registerGenerator('pdf-react', new ReactPDFGenerator());
    this.registerGenerator('pdf-puppeteer', new PuppeteerPDFGenerator());
    this.registerGenerator('excel', new ExcelGenerator());
    this.registerGenerator('html', new HTMLGenerator());
  }

  registerGenerator(type: string, generator: ReportGenerator) {
    this.generators.set(type, generator);
  }

  async generateReport(
    inspection: SavedInspection, 
    options: ReportGenerationOptions,
    generatorType: string = 'pdf-react'
  ): Promise<Blob> {
    const generator = this.generators.get(generatorType);
    if (!generator) {
      throw new Error(`Generator ${generatorType} not found`);
    }

    return await generator.generateReport(inspection, options);
  }

  getAvailableGenerators(): string[] {
    return Array.from(this.generators.keys());
  }
}

// React-PDF Implementation
class ReactPDFGenerator implements ReportGenerator {
  async generateReport(inspection: SavedInspection, options: ReportGenerationOptions): Promise<Blob> {
    // Implementation using @react-pdf/renderer
    const { pdf } = await import('@react-pdf/renderer');
    const document = this.createPDFDocument(inspection, options);
    return await pdf(document).toBlob();
  }

  async getPreview(inspection: SavedInspection, options: ReportGenerationOptions): Promise<string> {
    // Return base64 preview
    const blob = await this.generateReport(inspection, options);
    return URL.createObjectURL(blob);
  }

  getSupportedFormats(): string[] {
    return ['pdf'];
  }

  private createPDFDocument(inspection: SavedInspection, options: ReportGenerationOptions) {
    // React-PDF document creation logic
    return null; // Placeholder
  }
}

// Puppeteer Implementation (Server-side)
class PuppeteerPDFGenerator implements ReportGenerator {
  async generateReport(inspection: SavedInspection, options: ReportGenerationOptions): Promise<Blob> {
    // Call server-side API endpoint
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspection, options })
    });

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    return await response.blob();
  }

  async getPreview(inspection: SavedInspection, options: ReportGenerationOptions): Promise<string> {
    const blob = await this.generateReport(inspection, options);
    return URL.createObjectURL(blob);
  }

  getSupportedFormats(): string[] {
    return ['pdf'];
  }
}

// Excel Implementation
class ExcelGenerator implements ReportGenerator {
  async generateReport(inspection: SavedInspection, options: ReportGenerationOptions): Promise<Blob> {
    const { utils, writeFile } = await import('xlsx');
    
    // Create workbook with multiple sheets
    const workbook = utils.book_new();
    
    // Summary sheet
    const summaryData = this.createSummaryData(inspection);
    const summarySheet = utils.json_to_sheet(summaryData);
    utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Detailed inspection data
    const detailData = this.createDetailData(inspection);
    const detailSheet = utils.json_to_sheet(detailData);
    utils.book_append_sheet(workbook, detailSheet, 'Inspection Details');
    
    // Convert to blob
    const excelBuffer = writeFile(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async getPreview(inspection: SavedInspection, options: ReportGenerationOptions): Promise<string> {
    // Excel doesn't have preview, return placeholder
    return 'data:text/plain;base64,RXhjZWwgUHJldmlldyBOb3QgQXZhaWxhYmxl';
  }

  getSupportedFormats(): string[] {
    return ['xlsx', 'csv'];
  }

  private createSummaryData(inspection: SavedInspection) {
    return [
      { Field: 'Client Name', Value: inspection.clientName },
      { Field: 'Property Location', Value: inspection.propertyLocation },
      { Field: 'Inspector', Value: inspection.inspectorName },
      { Field: 'Inspection Date', Value: inspection.inspectionDate },
      { Field: 'Total Areas', Value: inspection.areas.length },
      // Add more summary data
    ];
  }

  private createDetailData(inspection: SavedInspection) {
    const details: any[] = [];
    
    inspection.areas.forEach(area => {
      area.items.forEach(item => {
        details.push({
          Area: area.name,
          Category: item.category,
          Point: item.point,
          Status: item.status,
          Comments: item.comments || '',
          Location: item.location || '',
          Photos: item.photos.length
        });
      });
    });
    
    return details;
  }
}

// HTML Generator (Enhanced)
class HTMLGenerator implements ReportGenerator {
  async generateReport(inspection: SavedInspection, options: ReportGenerationOptions): Promise<Blob> {
    const html = await this.generateHTML(inspection, options);
    return new Blob([html], { type: 'text/html' });
  }

  async getPreview(inspection: SavedInspection, options: ReportGenerationOptions): Promise<string> {
    const html = await this.generateHTML(inspection, options);
    return `data:text/html;base64,${btoa(html)}`;
  }

  getSupportedFormats(): string[] {
    return ['html'];
  }

  private async generateHTML(inspection: SavedInspection, options: ReportGenerationOptions): Promise<string> {
    // Generate enhanced HTML with better print support
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Property Inspection Report</title>
          <style>
            ${await this.getEnhancedPrintCSS()}
          </style>
        </head>
        <body>
          ${this.generateReportContent(inspection, options)}
          <script>
            // Auto-print when opened
            window.onload = () => {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `;
  }

  private async getEnhancedPrintCSS(): Promise<string> {
    // Return enhanced CSS for better printing
    return `
      @page {
        size: A4;
        margin: 15mm;
      }
      
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .avoid-break {
        page-break-inside: avoid;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        page-break-inside: auto;
      }
      
      thead {
        display: table-header-group;
      }
      
      tr {
        page-break-inside: avoid;
      }
      
      /* Add more enhanced print styles */
    `;
  }

  private generateReportContent(inspection: SavedInspection, options: ReportGenerationOptions): string {
    // Generate the actual report content
    return `<h1>Property Inspection Report</h1>
            <p>Client: ${inspection.clientName}</p>
            <!-- Add full report content -->`;
  }
}

export const reportService = new ReportGenerationService();