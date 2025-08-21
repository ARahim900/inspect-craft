# Disclaimer Content Template

## Instructions:
1. Copy the exact disclaimer content from your Word document
2. Replace the placeholder content in `src/config/disclaimer.ts`
3. Follow the format shown below

## Current Placeholder Content:
```typescript
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
```

## To Customize:
1. **Replace the title** with your exact disclaimer title
2. **Replace each section** with your content:
   - Use `content: "text"` for paragraph content
   - Use `items: ["item1", "item2"]` for bullet points
3. **Update the footer** with your contact information

## Example of How to Add Your Content:
```typescript
{
  title: "YOUR EXACT SECTION TITLE",
  content: "Your exact paragraph content from the Word document..."
},
{
  title: "SECTION WITH BULLET POINTS", 
  items: [
    "First bullet point from your document",
    "Second bullet point from your document",
    "Third bullet point from your document"
  ]
}
```

**Please provide the exact disclaimer content from your Word document, and I'll update the configuration file accordingly.**