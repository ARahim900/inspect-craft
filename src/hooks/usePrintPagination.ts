import { useEffect, useState } from 'react';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
}

export const usePrintPagination = (containerRef: React.RefObject<HTMLElement>) => {
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1
  });

  useEffect(() => {
    const calculatePages = () => {
      if (!containerRef.current) return;

      try {
        const container = containerRef.current;
        
        // Get the actual content height
        const containerHeight = container.scrollHeight;
        
        // A4 page dimensions at 96 DPI
        // Page height: 297mm = 1122px at 96 DPI
        // Margins: 31.75mm top + 31.75mm bottom = 63.5mm = 240px
        // Available content height per page: 1122 - 240 = 882px
        // Additional space for enhanced header/footer: 30mm + 35mm = 65mm = 246px
        // Final available content height: 882 - 246 = 636px
        const availablePageHeight = 636;
        
        // Calculate estimated pages with some buffer for page breaks
        let estimatedPages = Math.ceil(containerHeight / availablePageHeight);
        
        // Account for forced page breaks in the content
        const pageBreakElements = container.querySelectorAll('.page-break');
        const additionalPages = pageBreakElements.length;
        
        // Account for avoid-break elements that might push content to next page
        const avoidBreakElements = container.querySelectorAll('.avoid-break');
        const avoidBreakBuffer = Math.ceil(avoidBreakElements.length * 0.1); // 10% buffer
        
        estimatedPages = Math.max(1, estimatedPages + additionalPages + avoidBreakBuffer);
        
        // Cap at reasonable maximum to prevent excessive page counts
        estimatedPages = Math.min(estimatedPages, 50);
        
        setPagination({
          currentPage: 1,
          totalPages: estimatedPages
        });
      } catch (error) {
        console.warn('Error calculating pagination:', error);
        setPagination({
          currentPage: 1,
          totalPages: 1
        });
      }
    };

    // Calculate on mount
    calculatePages();
    
    // Debounced calculation for window resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculatePages, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Debounced calculation for content changes
    let mutationTimeout: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(calculatePages, 150);
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(mutationTimeout);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [containerRef]);

  return pagination;
};