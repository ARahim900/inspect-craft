import React from 'react';
import { cn } from '@/lib/utils';
import { getDisclaimerContent, type DisclaimerData } from '@/templates/disclaimer-content';

interface BilingualDisclaimerProps {
  clientName: string;
  propertyLocation: string;
  inspectionDate: string;
  inspectorName: string;
  propertyGrade?: string;
}

export function BilingualDisclaimer({ 
  clientName, 
  propertyLocation, 
  inspectionDate, 
  inspectorName, 
  propertyGrade = 'A' 
}: BilingualDisclaimerProps) {
  const disclaimerData: DisclaimerData = {
    clientName,
    propertyGrade,
    inspectionDate,
    inspectorName,
    propertyLocation
  };

  const content = getDisclaimerContent(disclaimerData);

  return (
    <section className="bilingual-disclaimer-section mb-8 space-y-6">
      {/* Report Header */}
      <div className="report-header-section">
        <table className="w-full border-2 border-blue-800">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="p-4 text-left font-bold text-lg border-r border-blue-300">
                Property Inspection Report
              </th>
              <th className="p-4 text-right font-bold text-lg" dir="rtl">
                تقرير فحص العقار
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Overview Section */}
      <div className="overview-section border-2 border-blue-800 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white p-3">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">OVERVIEW</h3>
            <h3 className="font-bold text-lg" dir="rtl">نظرة عامة</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 border-r border-gray-300">
            <div className="space-y-4 text-sm leading-relaxed">
              {content.overview.english.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-800">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <div className="p-6" dir="rtl">
            <div className="space-y-4 text-sm leading-relaxed">
              {content.overview.arabic.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-800">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Boxes */}
      <div className="disclaimer-boxes space-y-4">
        {content.disclaimerBoxes.map((box, index) => (
          <div key={index} className="border-2 border-blue-800 rounded-lg overflow-hidden">
            <div className="bg-blue-800 text-white p-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm">{box.title.english}</h4>
                <h4 className="font-bold text-sm" dir="rtl">{box.title.arabic}</h4>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-4 border-r border-gray-300">
                <p className="text-sm text-gray-800 leading-relaxed">{box.content.english}</p>
              </div>
              <div className="p-4" dir="rtl">
                <p className="text-sm text-gray-800 leading-relaxed">{box.content.arabic}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confidentiality Section */}
      <div className="confidentiality-section border-2 border-blue-800 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white p-3">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">{content.confidentiality.title.english}</h3>
            <h3 className="font-bold text-lg" dir="rtl">{content.confidentiality.title.arabic}</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 border-r border-gray-300">
            <p className="text-sm text-gray-800 leading-relaxed">
              {content.confidentiality.content.english}
            </p>
          </div>
          <div className="p-6" dir="rtl">
            <p className="text-sm text-gray-800 leading-relaxed">
              {content.confidentiality.content.arabic}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="signature-section border-2 border-blue-800 rounded-lg overflow-hidden">
        <div className="bg-blue-800 text-white p-3">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">Signatures</h3>
            <h3 className="font-bold text-lg" dir="rtl">التوقيعات</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Client Name | اسم العميل:</p>
                <p className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">{clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Signature | التوقيع:</p>
                <div className="h-16 border-b-2 border-gray-300"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Prepared by | أعد التقرير بواسطة:</p>
                <p className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">{inspectorName}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Date | التاريخ:</p>
                <p className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-4">
                  {new Date(inspectionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Stamp | الختم</p>
                <div className="w-24 h-24 border-2 border-gray-400 border-dashed rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">STAMP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Table Section Removed - as per user request */}

      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm 18mm 20mm 18mm !important;
          }
          
          body {
            margin: 0 !important;
            padding: 15mm !important;
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #333;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            box-sizing: border-box;
            background: white;
          }
          
          .report-container {
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box;
            background: white;
            width: 100% !important;
            max-width: 180mm !important;
          }
          
          .bilingual-disclaimer-section {
            font-size: 9pt;
            line-height: 1.3;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          
          .bilingual-disclaimer-section > * + * {
            margin-top: 6mm !important;
          }
          
          /* Prevent content cutoff - CRITICAL */
          .bilingual-disclaimer-section * {
            overflow: visible !important;
            word-wrap: break-word !important;
            word-break: normal !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          /* Safe content area */
          .bilingual-disclaimer-section {
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          .bilingual-disclaimer-section table,
          .bilingual-disclaimer-section th,
          .bilingual-disclaimer-section td {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .report-header-section {
            margin-bottom: 10mm !important;
          }
          
          .overview-section {
            margin-bottom: 8mm !important;
            page-break-inside: auto;
          }
          
          .disclaimer-boxes > * {
            margin-bottom: 6mm !important;
            page-break-inside: auto;
          }
          
          .confidentiality-section {
            margin-bottom: 8mm !important;
            page-break-inside: auto;
          }
          
          .signature-section {
            margin-bottom: 8mm !important;
            page-break-inside: auto;
          }
          
          .grade-table-section {
            margin-bottom: 6mm !important;
            page-break-inside: auto;
          }
          
          .bg-blue-800 {
            background-color: #1e40af !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-orange-200 {
            background-color: #fed7aa !important;
            color: #9a3412 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-orange-100 {
            background-color: #ffedd5 !important;
            color: #9a3412 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Professional spacing for text content */
          .overview-section p,
          .disclaimer-boxes p,
          .confidentiality-section p {
            margin-bottom: 3mm;
            text-align: justify;
          }
          
          /* Table cell padding for better readability */
          .bilingual-disclaimer-section th,
          .bilingual-disclaimer-section td {
            padding: 3mm 2mm !important;
            font-size: 8pt !important;
            vertical-align: top !important;
            margin: 0 !important;
          }
          
          /* Ensure tables fit within printable area - CRITICAL */
          .bilingual-disclaimer-section table {
            width: 100% !important;
            table-layout: fixed !important;
            margin: 0 !important;
            border-collapse: collapse !important;
          }
          
          /* Adjust column widths for bilingual content */
          .bilingual-disclaimer-section td:first-child,
          .bilingual-disclaimer-section th:first-child {
            width: 48% !important;
            text-align: left !important;
            padding-right: 2mm !important;
          }
          
          .bilingual-disclaimer-section td:last-child,
          .bilingual-disclaimer-section th:last-child {
            width: 48% !important;
            text-align: right !important;
            direction: rtl !important;
            padding-left: 2mm !important;
          }
          
          /* Grade table specific fixes */
          .grade-table-section table {
            font-size: 7pt !important;
          }
          
          .grade-table-section th,
          .grade-table-section td {
            padding: 1mm !important;
            font-size: 7pt !important;
            text-align: center !important;
          }
          
          /* Signature section spacing */
          .signature-section .space-y-4 > * + * {
            margin-top: 4mm !important;
          }
          
          /* Prevent orphaned content */
          h1, h2, h3, h4 {
            page-break-after: avoid;
          }
          
          /* Arabic text improvements for print */
          [dir="rtl"] {
            text-align: right;
            font-family: 'Arial Unicode MS', 'Tahoma', 'Arial', sans-serif;
          }
        }
      `}</style>
    </section>
  );
}