import React, { useRef, useEffect } from 'react';
import type { SavedInspection } from '@/services/storage-service';

interface BilingualReportProps {
  inspection: SavedInspection;
  onBack: () => void;
}

interface InspectionData {
  clientName: string;
  propertyGrade: 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D';
  inspectionDate: string;
  inspectorName: string;
  propertyAddress: string;
  reportNumber: string;
}

const BilingualReport: React.FC<BilingualReportProps> = ({ inspection, onBack }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Function to calculate property grade based on inspection results
  const calculatePropertyGrade = (inspection: SavedInspection): 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' => {
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

  // Function to format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to generate the bilingual report HTML
  const generateBilingualHTML = (): string => {
    const inspectionData: InspectionData = {
      clientName: inspection.clientName || 'Valued Client',
      propertyGrade: calculatePropertyGrade(inspection),
      inspectionDate: inspection.inspectionDate,
      inspectorName: inspection.inspectorName,
      propertyAddress: inspection.propertyLocation,
      reportNumber: inspection.id
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Inspection Report - تقرير فحص العقار</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.5;
            color: #333;
            background: white;
            font-size: 11pt;
            padding: 20px;
            margin: 0;
        }

        .arabic {
            font-family: 'Arial Unicode MS', 'Tahoma', 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
        }

        /* CRITICAL PRINT FIXES */
        @media print {
            @page {
                size: A4;
                margin: 18mm 15mm;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                margin: 0 !important;
                padding: 0 !important;
                font-size: 9pt !important;
                line-height: 1.3 !important;
                background: white !important;
                color: black !important;
                font-family: 'Arial', 'Helvetica', sans-serif !important;
            }
            
            .no-print {
                display: none !important;
            }
            
            .page-break {
                page-break-before: always;
                margin-top: 0;
            }
            
            .avoid-break {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            /* Fix all tables */
            table {
                width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                margin-bottom: 4mm !important;
                page-break-inside: avoid !important;
            }
            
            th, td {
                border: 0.5pt solid #333 !important;
                padding: 2mm !important;
                font-size: 8pt !important;
                line-height: 1.2 !important;
                vertical-align: top !important;
                word-wrap: break-word !important;
                overflow: visible !important;
            }
            
            /* Bilingual table specific fixes */
            .bilingual-table {
                margin-bottom: 6mm !important;
                page-break-inside: avoid !important;
            }
            
            .bilingual-table th {
                background: #1e3a8a !important;
                color: white !important;
                font-weight: bold !important;
                padding: 3mm !important;
                font-size: 9pt !important;
                text-align: center !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .bilingual-table td {
                padding: 4mm !important;
                font-size: 8pt !important;
                line-height: 1.3 !important;
            }
            
            .english-col {
                width: 50% !important;
                text-align: left !important;
            }
            
            .arabic-col {
                width: 50% !important;
                text-align: right !important;
                direction: rtl !important;
                font-family: 'Arial Unicode MS', 'Tahoma', sans-serif !important;
            }
            
            .section-header {
                background: #374151 !important;
                color: white !important;
                font-weight: bold !important;
                font-size: 9pt !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            /* Grade table fixes */
            .grade-table {
                margin: 6mm 0 !important;
                page-break-inside: avoid !important;
            }
            
            .grade-table th,
            .grade-table td {
                text-align: center !important;
                padding: 2mm !important;
                font-size: 8pt !important;
            }
            
            .grade-highlighted {
                background: #fbbf24 !important;
                color: #000 !important;
                font-weight: bold !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            /* Contact info fixes */
            .contact-info {
                background: #f3f4f6 !important;
                border-left: 2pt solid #3b82f6 !important;
                padding: 2mm !important;
                margin: 2mm 0 !important;
                font-size: 8pt !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .contact-info.arabic {
                border-left: none !important;
                border-right: 2pt solid #3b82f6 !important;
            }
            
            /* Signature section fixes */
            .signature-section {
                margin: 8mm 0 !important;
                page-break-inside: avoid !important;
            }
            
            .signature-row td {
                padding: 4mm !important;
                text-align: center !important;
            }
            
            .signature-line {
                width: 80mm !important;
                height: 20px !important;
                border-bottom: 1pt solid #000 !important;
                margin: 8px auto !important;
            }
            
            .stamp-placeholder {
                width: 40px !important;
                height: 40px !important;
                border: 1pt dashed #666 !important;
                font-size: 6pt !important;
                line-height: 38px !important;
                margin: 4px auto !important;
            }
            
            /* Typography fixes */
            p {
                margin-bottom: 2mm !important;
                font-size: 8pt !important;
                line-height: 1.3 !important;
                text-align: justify !important;
            }
            
            ul {
                margin: 2mm 0 !important;
                padding-left: 4mm !important;
            }
            
            li {
                margin-bottom: 1mm !important;
                font-size: 8pt !important;
            }
            
            /* Header improvements */
            .header {
                margin-bottom: 6mm !important;
                padding-bottom: 4mm !important;
                text-align: center !important;
            }
            
            /* Remove problematic styling that causes layout breaks */
            .bilingual-table,
            .grade-table,
            .signature-section {
                border: 1pt solid #333 !important;
            }
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2c3e50;
        }

        .bilingual-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid #2c3e50;
        }

        .bilingual-table th {
            background: #2c3e50;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
        }

        .bilingual-table td {
            padding: 15px;
            border: 1px solid #ddd;
            vertical-align: top;
        }

        .english-col {
            width: 50%;
            text-align: left;
        }

        .arabic-col {
            width: 50%;
            text-align: right;
            direction: rtl;
        }

        .section-header {
            background: #34495e;
            color: white;
            font-weight: bold;
            font-size: 13pt;
        }

        .contact-info {
            background: #ecf0f1;
            padding: 10px;
            border-left: 4px solid #3498db;
            margin: 10px 0;
        }

        .contact-info.arabic {
            border-right: 4px solid #3498db;
            border-left: none;
        }

        .grade-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #2c3e50;
        }

        .grade-table th {
            background: #2c3e50;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
        }

        .grade-table td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
        }

        .grade-highlighted {
            background: #f39c12 !important;
            color: white !important;
            font-weight: bold;
        }

        .signature-section {
            margin: 30px 0;
            border: 2px solid #2c3e50;
        }

        .signature-row td {
            padding: 20px;
            border-right: 1px solid #ddd;
        }

        .signature-row td:last-child {
            border-right: none;
        }

        .signature-line {
            border-bottom: 2px solid #333;
            height: 40px;
            margin-bottom: 10px;
            width: 200px;
        }

        .stamp-placeholder {
            width: 80px;
            height: 80px;
            border: 2px dashed #666;
            display: inline-block;
            text-align: center;
            line-height: 76px;
            font-size: 10pt;
            color: #666;
        }

        .grade-${inspectionData.propertyGrade.toLowerCase()} {
            background: #f39c12 !important;
            color: white !important;
            font-weight: bold;
        }
    </style>
</head>
<body onload="window.print(); window.onafterprint = () => window.close();">
    <div class="header">
        <div style="background: #2c3e50; color: white; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
            <table class="bilingual-table" style="margin: 0; border: none;">
                <tr>
                    <th class="english-col">Property Inspection Report</th>
                    <th class="arabic-col arabic">تقرير فحص العقار</th>
                </tr>
            </table>
        </div>
    </div>

    <table class="bilingual-table">
        <tr class="section-header">
            <td class="english-col">OVERVIEW</td>
            <td class="arabic-col arabic">نظرة عامة</td>
        </tr>
        <tr>
            <td class="english-col">
                <p><strong>Dear Mr. ${inspectionData.clientName}</strong></p>
                <br>
                <p>Thank you for choosing Wasla Real Estate Solutions as your home inspector.</p>
                <p>Your prospective home is basically in grade (${inspectionData.propertyGrade}) as per our inspection and classifications. However, a number of rather typical inspection issues were identified.</p>
                <p>Please review the annexed report carefully before making your decision. If you need further explanation regarding this property conditions, please don't hesitate to call or email us from 9:00 am to 5:00 PM at:</p>
                
                <div class="contact-info">
                    <strong>Email:</strong> wasla.solution@gmail.com<br>
                    <strong>Mobile:</strong> +968 90699799
                </div>
            </td>
            <td class="arabic-col arabic">
                <p><strong>الأفاضل/ ${inspectionData.clientName} المحترمون</strong></p>
                <br>
                <p>شكراً لاختياركم شركة وصلة للحلول العقارية كمفتش منازلكم.</p>
                <p>منزلكم المستقبلي في الأساس بدرجة (${inspectionData.propertyGrade}) حسب فحصنا وتصنيفاتنا. ومع ذلك، تم تحديد عدد من قضايا التفتيش النموذجية إلى حد ما.</p>
                <p>يرجى مراجعة التقرير المرفق بعناية قبل اتخاذ قرارك. إذا كنت بحاجة إلى مزيد من التوضيح بخصوص حالة هذه الخاصية، فلا تتردد في الاتصال بنا أو مراسلتنا عبر البريد الإلكتروني من الساعة 9:00 صباحاً إلى 5:00 مساءً على:</p>
                
                <div class="contact-info arabic">
                    <strong>البريد الإلكتروني:</strong> wasla.solution@gmail.com<br>
                    <strong>الهاتف المحمول:</strong> +968 90699799
                </div>
            </td>
        </tr>

        <tr class="section-header">
            <td class="english-col">No property is perfect.</td>
            <td class="arabic-col arabic">لا يوجد عقار مثالي</td>
        </tr>
        <tr>
            <td class="english-col">
                <p>Every property has some issues, regardless of age, price, or location. The key is to understand what you're buying and to be prepared for normal maintenance costs.</p>
                <p>This report identifies areas that need attention, but remember that even newly constructed homes have defects and maintenance requirements.</p>
                <p>Focus on safety issues and major structural concerns first, then prioritize other items based on cost and urgency.</p>
            </td>
            <td class="arabic-col arabic">
                <p>كل عقار له بعض المشاكل، بغض النظر عن العمر أو السعر أو الموقع. المفتاح هو فهم ما تشتريه والاستعداد لتكاليف الصيانة العادية.</p>
                <p>يحدد هذا التقرير المناطق التي تحتاج إلى اهتمام، ولكن تذكر أن حتى المنازل المبنية حديثاً لديها عيوب ومتطلبات صيانة.</p>
                <p>ركز على قضايا السلامة والمخاوف الهيكلية الرئيسية أولاً، ثم قم بترتيب أولويات العناصر الأخرى بناءً على التكلفة والإلحاح.</p>
            </td>
        </tr>

        <tr class="section-header">
            <td class="english-col">This report is not an appraisal.</td>
            <td class="arabic-col arabic">هذا التقرير ليس تقييماً سعرياً</td>
        </tr>
        <tr>
            <td class="english-col">
                <p>This inspection report is intended to provide information about the condition of the property's systems and components. It is not a property valuation or appraisal.</p>
                <p>The inspection identifies defects and safety issues, but does not determine the market value of the property.</p>
                <p>For property valuation, please consult with a qualified real estate appraiser.</p>
            </td>
            <td class="arabic-col arabic">
                <p>الغرض من تقرير التفتيش هذا هو تقديم معلومات حول حالة أنظمة ومكونات العقار. وهو ليس تقييماً أو تقديراً للعقار.</p>
                <p>يحدد التفتيش العيوب ومسائل السلامة، لكنه لا يحدد القيمة السوقية للعقار.</p>
                <p>لتقييم العقار، يرجى استشارة مقيم عقاري مؤهل.</p>
            </td>
        </tr>

        <tr class="section-header">
            <td class="english-col">Maintenance costs are normal.</td>
            <td class="arabic-col arabic">تكاليف الصيانة أمر طبيعي</td>
        </tr>
        <tr>
            <td class="english-col">
                <p>All properties require ongoing maintenance and periodic replacement of components. This is a normal part of property ownership.</p>
                <p>Budget for regular maintenance costs including HVAC servicing, plumbing maintenance, electrical updates, and exterior maintenance.</p>
                <p>Proper maintenance extends the life of property components and helps maintain property value.</p>
            </td>
            <td class="arabic-col arabic">
                <p>جميع العقارات تتطلب صيانة مستمرة واستبدال دوري للمكونات. هذا جزء طبيعي من ملكية العقار.</p>
                <p>ضع ميزانية لتكاليف الصيانة المنتظمة بما في ذلك صيانة التدفئة والتهوية وتكييف الهواء، وصيانة السباكة، والتحديثات الكهربائية، والصيانة الخارجية.</p>
                <p>الصيانة المناسبة تمدد عمر مكونات العقار وتساعد في الحفاظ على قيمة العقار.</p>
            </td>
        </tr>

        <tr class="section-header">
            <td class="english-col">SCOPE OF THE INSPECTION:</td>
            <td class="arabic-col arabic">نطاق الفحص:</td>
        </tr>
        <tr>
            <td class="english-col">
                <p>This inspection is a visual examination of the readily accessible areas and systems of the property. It includes:</p>
                <ul>
                    <li>Structural components</li>
                    <li>Electrical systems</li>
                    <li>Plumbing systems</li>
                    <li>HVAC systems</li>
                    <li>Interior and exterior surfaces</li>
                    <li>Doors and windows</li>
                    <li>Safety features</li>
                </ul>
                <p>The inspection does not include destructive testing, concealed areas, or areas not readily accessible.</p>
            </td>
            <td class="arabic-col arabic">
                <p>هذا الفحص هو فحص بصري للمناطق والأنظمة التي يسهل الوصول إليها في العقار. يشمل:</p>
                <ul>
                    <li>المكونات الهيكلية</li>
                    <li>الأنظمة الكهربائية</li>
                    <li>أنظمة السباكة</li>
                    <li>أنظمة التدفئة والتهوية وتكييف الهواء</li>
                    <li>الأسطح الداخلية والخارجية</li>
                    <li>الأبواب والنوافذ</li>
                    <li>ميزات السلامة</li>
                </ul>
                <p>لا يشمل الفحص الاختبارات المدمرة أو المناطق المخفية أو المناطق التي لا يمكن الوصول إليها بسهولة.</p>
            </td>
        </tr>

        <tr class="section-header">
            <td class="english-col">CONFIDENTIALITY OF THE REPORT:</td>
            <td class="arabic-col arabic">سرية التقرير:</td>
        </tr>
        <tr>
            <td class="english-col">
                <p>This report is confidential and is prepared exclusively for ${inspectionData.clientName}.</p>
                <p>The report may not be reproduced, distributed, or used by any other party without the written consent of the client and Wasla Real Estate Solutions.</p>
                <p>The information contained in this report is based on the conditions observed at the time of inspection on ${formatDate(inspectionData.inspectionDate)}.</p>
            </td>
            <td class="arabic-col arabic">
                <p>هذا التقرير سري ومُعد حصرياً لـ ${inspectionData.clientName}.</p>
                <p>لا يجوز استنساخ التقرير أو توزيعه أو استخدامه من قبل أي طرف آخر دون موافقة خطية من العميل وشركة وصلة للحلول العقارية.</p>
                <p>المعلومات الواردة في هذا التقرير تعتمد على الظروف المرصودة وقت التفتيش في ${formatDate(inspectionData.inspectionDate)}.</p>
            </td>
        </tr>
    </table>

    <table class="signature-section bilingual-table">
        <tr class="section-header">
            <td colspan="2" style="text-align: center;">SIGNATURES - التواقيع</td>
        </tr>
        <tr class="signature-row">
            <td class="english-col">
                <strong>Client Name:</strong> ${inspectionData.clientName}<br><br>
                <strong>Signature:</strong><br>
                <div class="signature-line"></div>
            </td>
            <td class="arabic-col arabic">
                <strong>اسم العميل:</strong> ${inspectionData.clientName}<br><br>
                <strong>التوقيع:</strong><br>
                <div class="signature-line"></div>
            </td>
        </tr>
        <tr class="signature-row">
            <td class="english-col">
                <strong>Prepared by:</strong> ${inspectionData.inspectorName}<br><br>
                <strong>Stamp:</strong><br>
                <div class="stamp-placeholder">COMPANY STAMP</div>
            </td>
            <td class="arabic-col arabic">
                <strong>أعد التقرير بواسطة:</strong> ${inspectionData.inspectorName}<br><br>
                <strong>الختم:</strong><br>
                <div class="stamp-placeholder">ختم الشركة</div>
            </td>
        </tr>
        <tr class="signature-row">
            <td class="english-col">
                <strong>Date:</strong> ${formatDate(inspectionData.inspectionDate)}
            </td>
            <td class="arabic-col arabic">
                <strong>التاريخ:</strong> ${formatDate(inspectionData.inspectionDate)}
            </td>
        </tr>
    </table>

    <table class="bilingual-table">
        <tr>
            <td class="english-col" style="text-align: center; font-weight: bold; font-size: 14pt;">
                Property Inspection report is annexed
            </td>
            <td class="arabic-col arabic" style="text-align: center; font-weight: bold; font-size: 14pt;">
                مرفق تقرير الفحص
            </td>
        </tr>
    </table>

    <table class="grade-table">
        <tr>
            <th colspan="7" style="background: #1e3a8a; color: white; font-size: 12pt; padding: 8px;">
                Property Grade Classification / تصنيف درجة العقار
            </th>
        </tr>
        <tr style="background: #f8f9fa;">
            <td style="font-weight: bold; width: 14%; text-align: center; background: #e9ecef;">Grade</td>
            <td style="font-weight: bold; width: 14%; text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'aaa' ? 'background: #fbbf24; color: black;' : ''}">AAA</td>
            <td style="font-weight: bold; width: 14%; text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'aa' ? 'background: #fbbf24; color: black;' : ''}">AA</td>
            <td style="font-weight: bold; width: 14%; text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'a' ? 'background: #fbbf24; color: black;' : ''}">A</td>
            <td style="font-weight: bold; width: 14%; text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'b' ? 'background: #fbbf24; color: black;' : ''}">B</td>
            <td style="font-weight: bold; width: 14%; text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'c' ? 'background: #fbbf24; color: black;' : ''}">C</td>
            <td style="font-weight: bold; width: 14%; text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'd' ? 'background: #fbbf24; color: black;' : ''}">D</td>
        </tr>
        <tr>
            <td style="font-weight: bold; background: #f8f9fa; text-align: left;">Description</td>
            <td style="text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'aaa' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">Excellent</td>
            <td style="text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'aa' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">Very Good</td>
            <td style="text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'a' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">Good</td>
            <td style="text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'b' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">Meeting standards</td>
            <td style="text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'c' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">Acceptable</td>
            <td style="text-align: center; ${inspectionData.propertyGrade.toLowerCase() === 'd' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">Require maintenance</td>
        </tr>
        <tr>
            <td style="font-weight: bold; background: #f8f9fa; direction: rtl; text-align: right;">الوصف</td>
            <td style="text-align: center; direction: rtl; ${inspectionData.propertyGrade.toLowerCase() === 'aaa' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">ممتاز</td>
            <td style="text-align: center; direction: rtl; ${inspectionData.propertyGrade.toLowerCase() === 'aa' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">جيد جداً</td>
            <td style="text-align: center; direction: rtl; ${inspectionData.propertyGrade.toLowerCase() === 'a' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">جيد</td>
            <td style="text-align: center; direction: rtl; ${inspectionData.propertyGrade.toLowerCase() === 'b' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">يلبي المعايير</td>
            <td style="text-align: center; direction: rtl; ${inspectionData.propertyGrade.toLowerCase() === 'c' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">مقبول</td>
            <td style="text-align: center; direction: rtl; ${inspectionData.propertyGrade.toLowerCase() === 'd' ? 'background: #fbbf24; color: black; font-weight: bold;' : ''}">تحتاج صيانة</td>
        </tr>
    </table>

    <div style="text-align: center; margin-top: 30px; padding: 15px; background: #ecf0f1; border-radius: 5px;">
        <p><strong>Report Number:</strong> ${inspectionData.reportNumber}</p>
        <p><strong>Property Address:</strong> ${inspectionData.propertyAddress}</p>
        <p><strong>رقم التقرير:</strong> ${inspectionData.reportNumber}</p>
        <p><strong>عنوان العقار:</strong> ${inspectionData.propertyAddress}</p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding: 15px; border-top: 2px solid #2c3e50; font-size: 10pt; color: #666;">
        <p><strong>Wasla Real Estate Solutions</strong></p>
        <p>Professional Property Inspection Services - خدمات فحص العقارات المهنية</p>
        <p>Email: wasla.solution@gmail.com | Mobile: +968 90699799</p>
    </div>
</body>
</html>`;
  };

  const handlePrintBilingual = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the bilingual report');
      return;
    }

    const htmlContent = generateBilingualHTML();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
        >
          ← Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            onClick={handlePrintBilingual}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
          >
            🌍 Print Bilingual Report
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bilingual Property Inspection Report
          </h1>
          <p className="text-gray-600 mb-4">
            تقرير فحص العقار ثنائي اللغة
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-lg">
            <div>
              <strong>Client:</strong> {inspection.clientName || 'N/A'}
            </div>
            <div>
              <strong>Inspector:</strong> {inspection.inspectorName}
            </div>
            <div>
              <strong>Property:</strong> {inspection.propertyLocation}
            </div>
            <div>
              <strong>Grade:</strong> 
              <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                {calculatePropertyGrade(inspection)}
              </span>
            </div>
            <div>
              <strong>Date:</strong> {formatDate(inspection.inspectionDate)}
            </div>
            <div>
              <strong>Report ID:</strong> {inspection.id}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Report Features:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>✓ Bilingual format (English/Arabic)</li>
            <li>✓ Professional table layout</li>
            <li>✓ Automatic grade calculation and highlighting</li>
            <li>✓ Print-optimized formatting</li>
            <li>✓ Company contact information</li>
            <li>✓ Signature sections for client and inspector</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={handlePrintBilingual}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md transition-colors"
          >
            🖨️ Generate & Print Bilingual Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default BilingualReport;