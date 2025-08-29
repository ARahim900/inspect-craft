import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { reportService, type ReportGenerationOptions } from '@/services/report-generation-service';
import type { SavedInspection } from '@/services/storage-service';

interface EnhancedReportGeneratorProps {
  inspection: SavedInspection;
  onBack: () => void;
}

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PreviewIcon = ({ className }: { className?: string }) => (
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

export const EnhancedReportGenerator: React.FC<EnhancedReportGeneratorProps> = ({ inspection, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'html' | 'docx'>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'detailed' | 'summary'>('standard');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [language, setLanguage] = useState<'en' | 'ar' | 'bilingual'>('bilingual');
  const [generatorType, setGeneratorType] = useState('pdf-react');

  const generateReport = useCallback(async (preview: boolean = false) => {
    setIsGenerating(true);
    try {
      const options: ReportGenerationOptions = {
        format: selectedFormat,
        template: selectedTemplate,
        includePhotos,
        language
      };

      if (preview) {
        // Generate preview
        const generator = reportService['generators'].get(generatorType);
        if (generator) {
          const previewUrl = await generator.getPreview(inspection, options);
          setPreviewUrl(previewUrl);
        }
      } else {
        // Generate and download report
        const blob = await reportService.generateReport(inspection, options, generatorType);
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inspection-report-${inspection.id}.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Report generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [inspection, selectedFormat, selectedTemplate, includePhotos, language, generatorType]);

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', description: 'Professional PDF report' },
    { value: 'excel', label: 'Excel Spreadsheet', description: 'Data analysis friendly' },
    { value: 'html', label: 'HTML Document', description: 'Web-friendly format' },
    { value: 'docx', label: 'Word Document', description: 'Editable document' }
  ];

  const templateOptions = [
    { value: 'standard', label: 'Standard Report', description: 'Complete inspection report' },
    { value: 'detailed', label: 'Detailed Report', description: 'Extended analysis and photos' },
    { value: 'summary', label: 'Executive Summary', description: 'Key findings only' }
  ];

  const generatorOptions = [
    { value: 'pdf-react', label: 'React PDF', description: 'Client-side PDF generation' },
    { value: 'pdf-puppeteer', label: 'Puppeteer PDF', description: 'Server-side high-quality PDF' },
    { value: 'excel', label: 'Excel Generator', description: 'Spreadsheet format' },
    { value: 'html', label: 'HTML Generator', description: 'Enhanced HTML with print support' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
        >
          <BackIcon />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Enhanced Report Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Report Configuration</h2>
            
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Output Format</label>
              <div className="grid grid-cols-1 gap-2">
                {formatOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={option.value}
                      checked={selectedFormat === option.value}
                      onChange={(e) => setSelectedFormat(e.target.value as any)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Report Template</label>
              <div className="grid grid-cols-1 gap-2">
                {templateOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="template"
                      value={option.value}
                      checked={selectedTemplate === option.value}
                      onChange={(e) => setSelectedTemplate(e.target.value as any)}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Generator Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Generation Method</label>
              <select
                value={generatorType}
                onChange={(e) => setGeneratorType(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {generatorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includePhotos"
                  checked={includePhotos}
                  onChange={(e) => setIncludePhotos(e.target.checked)}
                  className="text-primary focus:ring-primary"
                />
                <label htmlFor="includePhotos" className="text-sm font-medium text-gray-700">
                  Include Photos and Images
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="en">English Only</option>
                  <option value="ar">Arabic Only</option>
                  <option value="bilingual">Bilingual (English + Arabic)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => generateReport(true)}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
            >
              <PreviewIcon />
              {isGenerating ? 'Generating...' : 'Preview Report'}
            </button>
            
            <button
              onClick={() => generateReport(false)}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md disabled:opacity-50"
            >
              <DownloadIcon />
              {isGenerating ? 'Generating...' : 'Generate & Download'}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Report Preview</h2>
          
          {previewUrl ? (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-96"
                title="Report Preview"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <PreviewIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Click "Preview Report" to see how your report will look</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Report Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Client:</span>
            <p className="text-blue-900">{inspection.clientName}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Property:</span>
            <p className="text-blue-900">{inspection.propertyLocation}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Areas:</span>
            <p className="text-blue-900">{inspection.areas.length} areas</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Total Items:</span>
            <p className="text-blue-900">
              {inspection.areas.reduce((total, area) => total + area.items.length, 0)} items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};