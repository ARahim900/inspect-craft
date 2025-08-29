import React from 'react';
import { cn } from '@/lib/utils';

interface TableRow {
  id: string;
  cells: (string | React.ReactNode)[];
  grade?: string; // For grade highlighting
  className?: string;
}

interface EnhancedTableProps {
  /** Table headers */
  headers: string[];
  /** Table rows data */
  rows: TableRow[];
  /** Column index for grade highlighting (0-based) */
  gradeColumn?: number;
  /** Optional className for styling */
  className?: string;
  /** Whether to show table headers */
  showHeaders?: boolean;
  /** Custom column widths */
  columnWidths?: string[];
}

/**
 * EnhancedTable - Professional table component with clean design principles
 * 
 * Implements requirements 1.1-1.4:
 * - Subtle horizontal dividers between rows instead of full grid lines
 * - Light background shading for Grade D highlighting
 * - Bold formatting exclusively in Grade column for visual separation
 * - Eliminates excessive vertical and horizontal lines
 */
export const EnhancedTable: React.FC<EnhancedTableProps> = ({
  headers,
  rows,
  gradeColumn,
  className,
  showHeaders = true,
  columnWidths
}) => {
  const getGradeHighlightClass = (grade?: string) => {
    if (!grade) return '';
    
    // Grade D gets amber highlighting as per requirements
    if (grade.toUpperCase() === 'D') {
      return 'grade-highlight-d';
    }
    
    return '';
  };

  const isGradeColumn = (columnIndex: number) => {
    return gradeColumn !== undefined && columnIndex === gradeColumn;
  };

  return (
    <table className={cn("professional-table enhanced-table", className)}>
      {showHeaders && (
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn(
                  "table-header",
                  isGradeColumn(index) && "grade-column-header"
                )}
                style={columnWidths?.[index] ? { width: columnWidths[index] } : undefined}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={cn(
              "table-row",
              row.className,
              row.grade && getGradeHighlightClass(row.grade)
            )}
          >
            {row.cells.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={cn(
                  "table-cell",
                  isGradeColumn(cellIndex) && "grade-column",
                  row.grade && isGradeColumn(cellIndex) && getGradeHighlightClass(row.grade)
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EnhancedTable;