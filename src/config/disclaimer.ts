// Disclaimer content for professional reports
// This content can be customized based on your specific requirements

export const DISCLAIMER_CONTENT = {
  title: "Important Disclaimer & Terms",
  
  sections: [
    {
      title: "SCOPE OF INSPECTION",
      content: "This inspection report is based on a visual examination of the accessible areas of the property conducted on the date specified. The inspection does not include destructive testing or the examination of concealed or inaccessible areas."
    },
    {
      title: "LIMITATIONS",
      items: [
        "This inspection does not constitute a warranty or guarantee of the property's condition",
        "Hidden defects or issues not visible during the inspection may exist",
        "Seasonal conditions may affect certain systems or components",
        "Future performance of systems and components cannot be predicted"
      ]
    },
    {
      title: "RECOMMENDATIONS",
      items: [
        'Items marked as "Fail" require immediate professional attention',
        'Items marked as "Snags" should be addressed to maintain property condition',
        "Regular maintenance is recommended for all property systems",
        "Specialist evaluation may be required for certain systems"
      ]
    },
    {
      title: "LIABILITY",
      content: "Solution Property's liability is limited to the cost of this inspection. We recommend obtaining specialist advice for any concerns raised in this report. This report is confidential and intended solely for the use of the client named herein."
    },
    {
      title: "VALIDITY",
      content: "This report reflects the condition of the property at the time of inspection and is valid for 30 days from the inspection date. Property conditions may change over time."
    }
  ],
  
  footer: "For questions or clarifications regarding this report, please contact Solution Property."
};

// Additional report configuration
export const REPORT_CONFIG = {
  companyName: "Solution Property",
  reportTitle: "Property Inspection Report",
  logoPath: "/logo.jpeg",
  watermarkText: "SOLUTION PROPERTY",
  
  // Print settings
  pageMargin: "0.75in",
  pageSize: "A4",
  maxPhotosPerItem: 2, // Maximum photos to display per inspection item
  
  // Report sections to include
  includeSections: {
    executiveSummary: true,
    propertyDetails: true,
    inspectionAreas: true,
    signatures: true,
    disclaimer: true,
    footer: true
  },
  
  // Status colors for print
  statusColors: {
    Pass: "#16a34a",
    Fail: "#dc2626",
    Snags: "#ea580c"
  }
};

// Template for executive summary
export const EXECUTIVE_SUMMARY_TEMPLATE = {
  greeting: (clientName: string) => `Dear ${clientName || 'Valued Client'},`,
  
  introduction: (propertyLocation: string, propertyType: string, inspectorName: string, inspectionDate: string) => 
    `Solution Property is pleased to present this comprehensive inspection report for the property located at **${propertyLocation}**. This ${propertyType.toLowerCase()} has been thoroughly examined by our certified inspector, **${inspectorName}**, on **${new Date(inspectionDate).toLocaleDateString()}**.`,
  
  process: "Our inspection process follows industry-standard procedures and best practices to provide you with an accurate assessment of the property's current condition. We have evaluated various systems and components including structural elements, electrical systems, plumbing, HVAC, safety features, and overall property condition.",
  
  reportContent: 'This report contains detailed findings, photographic evidence where applicable, and professional recommendations. Each inspection point has been categorized as **Pass** (satisfactory condition), **Fail** (requires immediate attention), or **Snags** (minor issues requiring attention).',
  
  closing: "We encourage you to review this report carefully and contact us if you have any questions or require clarification on any findings."
};