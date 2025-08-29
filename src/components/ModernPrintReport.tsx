import React from 'react';
import { SavedInspection } from '@/services/storage-service';
import { PhotoDisplay } from './PhotoDisplay';
import { LocalStorageService } from '@/services/local-storage-service';

interface ModernPrintReportProps {
  inspection: SavedInspection;
  onBack: () => void;
}

export const ModernPrintReport: React.FC<ModernPrintReportProps> = ({ inspection, onBack }) => {
  const handlePrint = () => {
    window.print();
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
    if (stats.passPercentage >= 95 && stats.failPercentage === 0) return { grade: 'A+', color: '#10b981', label: 'Excellent' };
    if (stats.passPercentage >= 85) return { grade: 'A', color: '#22c55e', label: 'Very Good' };
    if (stats.passPercentage >= 75) return { grade: 'B', color: '#3b82f6', label: 'Good' };
    if (stats.passPercentage >= 65) return { grade: 'C', color: '#f59e0b', label: 'Fair' };
    return { grade: 'D', color: '#ef4444', label: 'Needs Improvement' };
  };

  const stats = calculateStats();
  const grade = getPropertyGrade();
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
          }
          
          .page-break {
            page-break-before: always !important;
          }
          
          .avoid-break {
            page-break-inside: avoid !important;
          }
          
          table {
            page-break-inside: auto !important;
          }
          
          tr {
            page-break-inside: avoid !important;
          }
          
          .modern-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .stats-card {
            background: white !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          }
          
          .grade-badge {
            background: white !important;
            color: ${grade.color} !important;
            border: 3px solid ${grade.color} !important;
          }
          
          .photo-grid img {
            max-width: 180px !important;
            max-height: 135px !important;
          }
        }
        
        @media screen {
          .print-container {
            background: white;
            box-shadow: 0 20px 50px rgba(0,0,0,0.1);
            border-radius: 16px;
            overflow: hidden;
          }
        }
        
        .modern-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }
        
        .modern-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .modern-header::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -5%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }
        
        .content-section {
          padding: 40px 48px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .stats-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          transition: transform 0.2s;
        }
        
        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }
        
        .grade-section {
          text-align: center;
          padding: 40px;
          background: linear-gradient(to bottom, #f9fafb, white);
        }
        
        .grade-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          font-size: 48px;
          font-weight: 700;
          background: white;
          color: ${grade.color};
          border: 4px solid ${grade.color};
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          margin-bottom: 16px;
        }
        
        .inspection-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
          border: 2px solid #e5e7eb;
          background: white;
        }
        
        .inspection-table thead {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
        }
        
        .inspection-table th {
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          white-space: nowrap;
        }
        
        .inspection-table td {
          padding: 12px;
          border: 1px solid #e5e7eb;
          color: #374151;
          font-size: 13px;
          vertical-align: top;
          background: white;
        }
        
        .inspection-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .inspection-table tbody tr:hover {
          background-color: #f3f4f6;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
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
        
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
        }
        
        .photo-grid img {
          width: 100%;
          height: 90px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
        }
        
        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          padding: 40px 48px;
          background: #f9fafb;
          border-top: 2px solid #e5e7eb;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 2px solid #9ca3af;
          margin-bottom: 8px;
          height: 60px;
        }
        
        .footer {
          background: linear-gradient(135deg, #374151, #1f2937);
          color: white;
          padding: 32px 48px;
          text-align: center;
        }
        
        .progress-bar {
          width: 100%;
          height: 24px;
          background: #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }
        
        .progress-segment {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }
        
        .area-header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 16px 24px;
          border-radius: 12px 12px 0 0;
          font-size: 18px;
          font-weight: 600;
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .area-icon {
          width: 28px;
          height: 28px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
          font-weight: bold;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          padding: 32px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 32px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 16px;
          color: #1f2937;
          font-weight: 500;
        }
      `}</style>

      {/* Control Buttons - Not printed */}
      <div className="no-print flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Main Report Container */}
      <div className="print-container">
        {/* Modern Header */}
        <div className="modern-header">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">SP</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Solution Property</h1>
                  <p className="text-purple-100">Professional Inspection Services</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-100">Report ID</p>
                <p className="text-xl font-semibold">{inspection.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-2">Property Inspection Report</h2>
            <p className="text-lg text-purple-100">{reportDate}</p>
          </div>
        </div>

        {/* Property Information */}
        <div className="content-section">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Property Information</h3>
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

        {/* Property Grade Classification */}
        <div className="content-section avoid-break">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Property Grade Classification</h3>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            {/* Grade Table */}
            <div style={{ flex: '1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #4f46e5' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    <th colSpan={2} style={{ padding: '12px', color: 'white', fontSize: '16px', fontWeight: '600', textAlign: 'center' }}>
                      تصنيف درجة العقار / Property Grade Classification
                    </th>
                  </tr>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '10px', border: '1px solid #e5e7eb', width: '30%', fontWeight: '600' }}>Grade</th>
                    <th style={{ padding: '10px', border: '1px solid #e5e7eb', fontWeight: '600' }}>Description / الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: grade.grade === 'A+' ? '#d1fae5' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '600', fontSize: '18px', color: '#10b981' }}>A+</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Excellent - ممتاز (95%+ Pass, 0% Fail)</td>
                  </tr>
                  <tr style={{ background: grade.grade === 'A' ? '#d1fae5' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '600', fontSize: '18px', color: '#22c55e' }}>A</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Very Good - جيد جداً (85%+ Pass)</td>
                  </tr>
                  <tr style={{ background: grade.grade === 'B' ? '#dbeafe' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '600', fontSize: '18px', color: '#3b82f6' }}>B</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Good - جيد (75%+ Pass)</td>
                  </tr>
                  <tr style={{ background: grade.grade === 'C' ? '#fed7aa' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '600', fontSize: '18px', color: '#f59e0b' }}>C</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Fair - مقبول (65%+ Pass)</td>
                  </tr>
                  <tr style={{ background: grade.grade === 'D' ? '#fee2e2' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: '600', fontSize: '18px', color: '#ef4444' }}>D</td>
                    <td style={{ padding: '10px', border: '1px solid #e5e7eb' }}>Needs Improvement - يحتاج تحسين (&lt;65% Pass)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Current Grade Display */}
            <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, #f3f4f6, white)', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Current Grade</p>
              <div className="grade-badge" style={{ margin: '0 auto 16px' }}>{grade.grade}</div>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: grade.color, marginBottom: '8px' }}>{grade.label}</h4>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Based on {stats.totalItems} points</p>
              
              {/* Mini Progress Bar */}
              <div style={{ marginTop: '16px' }}>
                <div className="progress-bar" style={{ height: '20px' }}>
                  {stats.passPercentage > 0 && (
                    <div 
                      className="progress-segment" 
                      style={{ 
                        width: `${stats.passPercentage}%`, 
                        background: '#10b981',
                        fontSize: '11px'
                      }}
                    >
                      {stats.passPercentage}%
                    </div>
                  )}
                  {stats.snagsPercentage > 0 && (
                    <div 
                      className="progress-segment" 
                      style={{ 
                        width: `${stats.snagsPercentage}%`, 
                        background: '#f59e0b',
                        fontSize: '11px'
                      }}
                    >
                      {stats.snagsPercentage}%
                    </div>
                  )}
                  {stats.failPercentage > 0 && (
                    <div 
                      className="progress-segment" 
                      style={{ 
                        width: `${stats.failPercentage}%`, 
                        background: '#ef4444',
                        fontSize: '11px'
                      }}
                    >
                      {stats.failPercentage}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="content-section">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Inspection Summary</h3>
          <div className="stats-grid">
            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-green-600">{stats.passCount}</span>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 font-medium">Passed Items</p>
              <p className="text-sm text-gray-500 mt-1">{stats.passPercentage}% of total</p>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-amber-600">{stats.snagsCount}</span>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 font-medium">Minor Issues</p>
              <p className="text-sm text-gray-500 mt-1">{stats.snagsPercentage}% of total</p>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-red-600">{stats.failCount}</span>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 font-medium">Failed Items</p>
              <p className="text-sm text-gray-500 mt-1">{stats.failPercentage}% of total</p>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-indigo-600">{stats.totalItems}</span>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 font-medium">Total Points</p>
              <p className="text-sm text-gray-500 mt-1">{inspection.areas.length} areas checked</p>
            </div>
          </div>
        </div>

        {/* Detailed Inspection Results */}
        <div className="content-section">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Detailed Inspection Results</h3>
          
          {inspection.areas.map((area, areaIndex) => (
            <div key={area.id} className={areaIndex > 0 ? 'page-break' : ''}>
              <div className="area-header">
                <div className="area-icon">{areaIndex + 1}</div>
                <span>{area.name}</span>
              </div>
              
              {area.items.length > 0 ? (
                <table className="inspection-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%', textAlign: 'center' }}>#</th>
                      <th style={{ width: '20%' }}>Category</th>
                      <th style={{ width: '20%' }}>Inspection Point</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                      <th style={{ width: '15%' }}>Location</th>
                      <th style={{ width: '20%' }}>Comments</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Photos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.items.map((item, itemIndex) => (
                      <tr key={item.id} className="avoid-break">
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>
                          {itemIndex + 1}
                        </td>
                        <td>
                          <p className="font-medium">{item.category}</p>
                        </td>
                        <td>
                          <p className="text-sm">{item.point}</p>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-badge ${
                            item.status === 'Pass' ? 'status-pass' : 
                            item.status === 'Fail' ? 'status-fail' : 
                            'status-snags'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <p className="text-sm">{item.location || '-'}</p>
                        </td>
                        <td>
                          <p className="text-sm">{item.comments || '-'}</p>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {item.photos.length > 0 ? (
                            <span className="text-sm font-medium">{item.photos.length} 📷</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-b-lg">
                  <p className="text-gray-500">No inspection points recorded for this area</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Photo Appendix - Show all photos in organized way */}
        {(() => {
          const allPhotos: { area: string; item: string; photos: string[] }[] = [];
          inspection.areas.forEach(area => {
            area.items.forEach(item => {
              if (item.photos.length > 0) {
                allPhotos.push({
                  area: area.name,
                  item: `${item.category} - ${item.point}`,
                  photos: item.photos
                });
              }
            });
          });
          
          if (allPhotos.length > 0) {
            return (
              <div className="content-section page-break">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Photo Documentation Appendix</h3>
                {allPhotos.map((photoGroup, groupIndex) => (
                  <div key={groupIndex} className="mb-6 avoid-break">
                    <div style={{ background: '#f9fafb', padding: '8px 12px', borderLeft: '4px solid #6366f1', marginBottom: '12px' }}>
                      <p className="font-semibold text-gray-800">{photoGroup.area}</p>
                      <p className="text-sm text-gray-600">{photoGroup.item}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {photoGroup.photos.map((photoId, idx) => {
                        const isBase64 = photoId.startsWith('data:');
                        const isUrl = photoId.startsWith('http://') || photoId.startsWith('https://');
                        const hasPhoto = isBase64 || isUrl || LocalStorageService.getPhoto(photoId);
                        
                        if (!hasPhoto) return null;
                        
                        return (
                          <div key={idx} style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                            <PhotoDisplay
                              photoId={photoId}
                              alt={`Photo ${idx + 1}`}
                            />
                            <div style={{ padding: '4px', background: '#f9fafb', textAlign: 'center' }}>
                              <p className="text-xs text-gray-600">Photo {idx + 1}</p>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })()}
        
        {/* Signature Section */}
        <div className="signature-section avoid-break">
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="font-semibold text-gray-800">{inspection.inspectorName}</p>
            <p className="text-sm text-gray-600">Inspector Signature</p>
            <p className="text-xs text-gray-500 mt-1">{reportDate}</p>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="font-semibold text-gray-800">{inspection.clientName || 'Client Name'}</p>
            <p className="text-sm text-gray-600">Client Signature</p>
            <p className="text-xs text-gray-500 mt-1">Date: ________________</p>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Important Notice</h4>
            <p className="text-sm text-gray-300 max-w-3xl mx-auto">
              This inspection report is a professional assessment conducted at a specific point in time. 
              It reflects the condition of the property as observed during the inspection. 
              Some issues may not be immediately visible and could develop over time.
            </p>
          </div>
          <div className="pt-4 border-t border-gray-600">
            <p className="text-sm">© 2024 Solution Property - Professional Property Inspection Services</p>
            <p className="text-xs text-gray-400 mt-1">
              Report Generated: {new Date().toLocaleString()} | Report ID: {inspection.id}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};