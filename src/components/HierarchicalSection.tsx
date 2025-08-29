import React from 'react';
import { cn } from '@/lib/utils';

interface HierarchicalSectionProps {
  level: 1 | 2 | 3 | 4;
  title: string;
  children: React.ReactNode;
  className?: string;
  useMultiColumn?: boolean;
  columnCount?: 2 | 3;
  showAttentionGuide?: boolean;
  showVisualFlow?: boolean;
}

export const HierarchicalSection: React.FC<HierarchicalSectionProps> = ({
  level,
  title,
  children,
  className,
  useMultiColumn = false,
  columnCount = 2,
  showAttentionGuide = false,
  showVisualFlow = false
}) => {
  const getHeaderClass = (level: number) => {
    switch (level) {
      case 1:
        return 'main-heading';
      case 2:
        return 'section-header';
      case 3:
        return 'subsection-header';
      case 4:
        return 'sub-subsection-header';
      default:
        return 'section-header';
    }
  };

  const getContainerClass = (level: number) => {
    switch (level) {
      case 1:
        return 'content-hierarchy-level-1 whitespace-large';
      case 2:
        return 'content-hierarchy-level-2 whitespace-medium';
      case 3:
        return 'content-hierarchy-level-3 whitespace-small';
      case 4:
        return 'content-group-secondary whitespace-micro';
      default:
        return 'content-hierarchy-level-2 whitespace-medium';
    }
  };

  const getMultiColumnClass = () => {
    if (!useMultiColumn) return '';
    return columnCount === 3 ? 'multi-column-3' : 'multi-column-2';
  };

  const getAttentionGuideClass = () => {
    if (!showAttentionGuide) return '';
    return level <= 2 ? 'attention-guide-primary' : 'attention-guide-secondary';
  };

  const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <section 
      className={cn(
        getContainerClass(level),
        showVisualFlow && 'visual-flow-container',
        getAttentionGuideClass(),
        className
      )}
    >
      <HeaderTag className={getHeaderClass(level)}>
        {title}
      </HeaderTag>
      
      <div 
        className={cn(
          'section-content',
          getMultiColumnClass(),
          showVisualFlow && 'reading-flow-indicator'
        )}
      >
        {children}
      </div>
    </section>
  );
};

interface ContentGroupProps {
  type: 'primary' | 'secondary' | 'info-dense';
  children: React.ReactNode;
  className?: string;
  useMultiColumn?: boolean;
  columnCount?: 2 | 3;
}

export const ContentGroup: React.FC<ContentGroupProps> = ({
  type,
  children,
  className,
  useMultiColumn = false,
  columnCount = 2
}) => {
  const getGroupClass = () => {
    switch (type) {
      case 'primary':
        return 'content-group-primary';
      case 'secondary':
        return 'content-group-secondary';
      case 'info-dense':
        return 'multi-column-info-dense';
      default:
        return 'content-group';
    }
  };

  const getMultiColumnClass = () => {
    if (!useMultiColumn || type === 'info-dense') return '';
    return columnCount === 3 ? 'multi-column-3' : 'multi-column-2';
  };

  return (
    <div 
      className={cn(
        getGroupClass(),
        getMultiColumnClass(),
        className
      )}
    >
      {children}
    </div>
  );
};

interface DataRelationshipProps {
  type: 'primary' | 'secondary';
  data: Array<{ key: string; value: string | React.ReactNode }>;
  className?: string;
}

export const DataRelationship: React.FC<DataRelationshipProps> = ({
  type,
  data,
  className
}) => {
  const containerClass = type === 'primary' 
    ? 'data-relationship-primary' 
    : 'data-relationship-secondary';

  return (
    <div className={cn(containerClass, className)}>
      {data.map((item, index) => (
        <React.Fragment key={index}>
          <div className="data-key">{item.key}:</div>
          <div className="data-value">{item.value}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

interface HighlightBoxProps {
  type: 'primary' | 'secondary' | 'important' | 'standard';
  children: React.ReactNode;
  className?: string;
}

export const HighlightBox: React.FC<HighlightBoxProps> = ({
  type,
  children,
  className
}) => {
  const getHighlightClass = () => {
    switch (type) {
      case 'primary':
        return 'highlight-primary';
      case 'secondary':
        return 'highlight-secondary';
      case 'important':
        return 'important-note';
      case 'standard':
        return 'highlight-text';
      default:
        return 'highlight-text';
    }
  };

  return (
    <div className={cn(getHighlightClass(), className)}>
      {children}
    </div>
  );
};