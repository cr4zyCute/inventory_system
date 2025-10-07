import React from 'react';
import Skeleton from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
  variant?: 'products' | 'users' | 'orders' | 'generic';
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
  showAvatar?: boolean;
  showActions?: boolean;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 8,
  columns = 6,
  showHeader = true,
  className = '',
  variant = 'generic',
  animation = 'wave',
  showAvatar = true,
  showActions = true
}) => {
  const getColumnWidths = () => {
    switch (variant) {
      case 'products':
        return ['35%', '15%', '12%', '12%', '12%', '14%'];
      case 'users':
        return ['30%', '25%', '15%', '15%', '15%'];
      case 'orders':
        return ['20%', '20%', '15%', '15%', '15%', '15%'];
      default:
        return Array(columns).fill(`${100 / columns}%`);
    }
  };


  const renderFirstColumn = (rowIndex: number) => {
    if (variant === 'products') {
      return (
        <div className="skeleton-product-info">
          {showAvatar && (
            <div className="skeleton-avatar">
              <Skeleton 
                width="40px" 
                height="40px" 
                variant="rounded" 
                animation={animation}
              />
            </div>
          )}
          <div>
            <Skeleton 
              height="16px" 
              width={`${65 + (rowIndex % 3) * 10}%`} 
              animation={animation}
              size="md"
            />
            <div style={{ marginTop: '6px' }}>
              <Skeleton 
                height="12px" 
                width={`${40 + (rowIndex % 4) * 8}%`} 
                animation={animation}
                size="sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (variant === 'users') {
      return (
        <div className="skeleton-product-info">
          {showAvatar && (
            <div className="skeleton-avatar">
              <Skeleton 
                width="36px" 
                height="36px" 
                variant="circular" 
                animation={animation}
              />
            </div>
          )}
          <div>
            <Skeleton 
              height="16px" 
              width={`${60 + (rowIndex % 3) * 12}%`} 
              animation={animation}
              size="md"
            />
            <div style={{ marginTop: '4px' }}>
              <Skeleton 
                height="12px" 
                width={`${45 + (rowIndex % 3) * 10}%`} 
                animation={animation}
                size="sm"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <Skeleton 
        height="16px" 
        width={`${55 + (rowIndex % 4) * 15}%`} 
        animation={animation}
        size="md"
      />
    );
  };

  const renderRegularColumn = (colIndex: number, rowIndex: number) => {
    const widthVariations = [
      `${50 + (rowIndex % 3) * 10}%`,
      `${60 + (colIndex % 3) * 8}%`,
      `${45 + ((rowIndex + colIndex) % 4) * 12}%`,
      `${70 + (rowIndex % 2) * 10}%`
    ];

    const width = widthVariations[colIndex % widthVariations.length];

    // Special handling for status columns
    if ((variant === 'products' && colIndex === 4) || 
        (variant === 'users' && colIndex === 3) ||
        (variant === 'orders' && colIndex === 3)) {
      return (
        <Skeleton 
          height="24px" 
          width="80px" 
          variant="rounded" 
          animation={animation}
        />
      );
    }

    return (
      <Skeleton 
        height="16px" 
        width={width} 
        animation={animation}
        size="md"
      />
    );
  };

  const renderActionsColumn = () => {
    if (!showActions) return null;
    
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Skeleton 
          height="32px" 
          width="32px" 
          variant="circular" 
          animation={animation}
        />
        <Skeleton 
          height="8px" 
          width="8px" 
          variant="circular" 
          animation={animation}
        />
      </div>
    );
  };

  const columnWidths = getColumnWidths();
  const actualColumns = showActions ? columns : columns - 1;

  return (
    <div className={`table-skeleton ${className}`}>
      <div className="table-container">
        <table className="skeleton-table">
          {showHeader && (
            <thead>
              <tr className="table-header">
                {Array.from({ length: actualColumns }).map((_, index) => (
                  <th 
                    key={index} 
                    className="table-header-cell"
                    style={{ width: columnWidths[index] }}
                  >
                    <Skeleton 
                      height="18px" 
                      width={`${60 + (index % 3) * 15}%`} 
                      animation={animation}
                      size="md"
                    />
                  </th>
                ))}
                {showActions && (
                  <th className="table-header-cell" style={{ width: '80px' }}>
                    <Skeleton 
                      height="18px" 
                      width="60%" 
                      animation={animation}
                      size="md"
                    />
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="table-row">
                {/* First column with special styling */}
                <td className="table-cell">
                  {renderFirstColumn(rowIndex)}
                </td>
                
                {/* Regular columns */}
                {Array.from({ length: actualColumns - 1 }).map((_, colIndex) => (
                  <td key={colIndex + 1} className="table-cell">
                    {renderRegularColumn(colIndex + 1, rowIndex)}
                  </td>
                ))}
                
                {/* Actions column */}
                {showActions && (
                  <td className="table-cell">
                    {renderActionsColumn()}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
