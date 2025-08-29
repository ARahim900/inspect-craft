import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { PhotoDisplay } from './PhotoDisplay';
import { BilingualDisclaimer } from './BilingualDisclaimer';
import { DISCLAIMER_CONTENT } from '@/config/disclaimer';
import { LocalStorageService } from '@/services/local-storage-service';
import type { SavedInspection } from '@/services/storage-service';

interface SimplePrintReportProps {
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

export const SimplePrintReport: React.FC<SimplePrintReportProps> = ({ inspection, onBack }) => {
  const calculatePropertyGrade = (inspection: SavedInspection): string => {
    let totalItems = 0;
    let passCount = 0;
    let failCount = 0;

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

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString();
  const reportDate = inspection.inspectionDate || currentDate;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }
          
          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
            font-size: 9pt !important;
          }
          
          th {
            background-color: #e0e0e0 !important;
            font-weight: bold !important;
          }
          
          tr {
            page-break-inside: avoid !important;
          }
          
          img {
            max-width: 100px !important;
            max-height: 75px !important;
            object-fit: cover !important;
            page-break-inside: avoid !important;
          }
          
          .page-break {
            page-break-before: always !important;
          }
          
          .avoid-break {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4 no-print">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            <BackIcon />
            Back to Dashboard
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md"
          >
            <PrintIcon />
            Print Report
          </button>
        </div>

        <div className="print-container bg-white border rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8 pb-4 border-b-2 border-blue-600">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Solution Property</h1>
            <h2 className="text-xl font-bold mb-1">Property Inspection Report</h2>
            <p className="text-gray-600">Professional Assessment Document</p>
          </div>

          {/* Property Information */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-blue-600">Client Name: </span>
                <span>{inspection.clientName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-bold text-blue-600">Inspector: </span>
                <span>{inspection.inspectorName}</span>
              </div>
              <div>
                <span className="font-bold text-blue-600">Property Location: </span>
                <span>{inspection.propertyLocation}</span>
              </div>
              <div>
                <span className="font-bold text-blue-600">Report Date: </span>
                <span>{new Date(reportDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-bold text-blue-600">Property Type: </span>
                <span>{inspection.propertyType}</span>
              </div>
              <div>
                <span className="font-bold text-blue-600">Inspection Date: </span>
                <span>{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Property Grade */}
          <div className="text-center mb-6">
            <span className="text-lg font-bold">Property Grade: </span>
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded font-bold text-xl">
              {calculatePropertyGrade(inspection)}
            </span>
          </div>

          {/* Bilingual Disclaimer */}
          <div className="mb-8">
            <BilingualDisclaimer
              clientName={inspection.clientName || 'Valued Client'}
              propertyLocation={inspection.propertyLocation}
              inspectionDate={inspection.inspectionDate}
              inspectorName={inspection.inspectorName}
              propertyGrade={calculatePropertyGrade(inspection)}
            />
          </div>

          {/* Inspection Areas */}
          {inspection.areas.map((area, areaIndex) => (
            <div key={area.id} className={areaIndex > 0 ? 'page-break' : ''}>
              <h3 className="bg-blue-600 text-white p-3 font-bold text-lg mb-0">
                Area: {area.name}
              </h3>
              
              {area.items.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-black p-2 bg-gray-200 text-left" style={{ width: '25%' }}>
                        Inspection Point
                      </th>
                      <th className="border border-black p-2 bg-gray-200 text-center" style={{ width: '10%' }}>
                        Status
                      </th>
                      <th className="border border-black p-2 bg-gray-200 text-left" style={{ width: '35%' }}>
                        Comments & Location
                      </th>
                      <th className="border border-black p-2 bg-gray-200 text-left" style={{ width: '30%' }}>
                        Evidence
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.items.map(item => (
                      <tr key={item.id} className="avoid-break">
                        <td className="border border-black p-2 align-top">
                          <strong>{item.category}</strong>
                          <br />
                          <span className="text-sm">{item.point}</span>
                        </td>
                        <td className={cn(
                          "border border-black p-2 text-center font-bold",
                          item.status === 'Pass' && "bg-green-100",
                          item.status === 'Fail' && "bg-red-100",
                          item.status === 'Snags' && "bg-yellow-100"
                        )}>
                          {item.status}
                        </td>
                        <td className="border border-black p-2 align-top">
                          {item.comments && (
                            <div className="mb-2">
                              <strong>Comments:</strong>
                              <br />
                              {item.comments}
                            </div>
                          )}
                          {item.location && (
                            <div>
                              <strong>Location:</strong>
                              <br />
                              {item.location}
                            </div>
                          )}
                          {!item.comments && !item.location && (
                            <em className="text-gray-500">No details</em>
                          )}
                        </td>
                        <td className="border border-black p-2 align-top">
                          {item.photos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {item.photos.slice(0, 2).map((photoId, idx) => {
                                const isBase64 = photoId.startsWith('data:');
                                const isUrl = photoId.startsWith('http://') || photoId.startsWith('https://');
                                const hasPhoto = isBase64 || isUrl || LocalStorageService.getPhoto(photoId);
                                
                                if (!hasPhoto) return null;
                                
                                return (
                                  <div key={idx} className="text-center">
                                    <PhotoDisplay
                                      photoId={photoId}
                                      className="w-24 h-18 object-cover border border-gray-400"
                                      alt={`Photo ${idx + 1}`}
                                    />
                                    <div className="text-xs text-gray-600 mt-1">
                                      Photo {idx + 1}
                                    </div>
                                  </div>
                                );
                              }).filter(Boolean)}
                              {item.photos.length > 2 && (
                                <div className="text-xs italic text-gray-600 w-full text-center">
                                  +{item.photos.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <em className="text-gray-500 text-sm">No photos</em>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 italic text-gray-600 text-center border border-gray-300">
                  No inspection points recorded for this area.
                </div>
              )}
            </div>
          ))}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-8 p-4 border border-gray-300 rounded avoid-break">
            <div className="text-center">
              <div className="border-b-2 border-black mb-2 h-12"></div>
              <div className="font-bold">Inspector Signature</div>
              <div className="text-sm">{inspection.inspectorName}</div>
              <div className="text-sm">Date: {new Date(reportDate).toLocaleDateString()}</div>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-black mb-2 h-12"></div>
              <div className="font-bold">Client Signature</div>
              <div className="text-sm">{inspection.clientName || 'Client Name'}</div>
              <div className="text-sm">Date: _________________</div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded p-4 mt-6 avoid-break">
            <h3 className="font-bold text-center text-lg mb-2 text-yellow-800">
              {DISCLAIMER_CONTENT.title}
            </h3>
            {DISCLAIMER_CONTENT.sections.map((section, index) => (
              <div key={index} className="mb-2 text-sm">
                <strong>{section.title}:</strong>
                {section.content && <p>{section.content}</p>}
                {section.items && (
                  <ul className="list-disc ml-5">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <p className="text-center font-bold mt-4">
              {DISCLAIMER_CONTENT.footer}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t-2 border-gray-300 text-sm text-gray-600">
            <p><strong>Solution Property</strong> - Professional Property Inspection Services</p>
            <p>Report ID: {inspection.id} | Generated: {currentDate}</p>
          </div>
        </div>
      </div>
    </>
  );
};