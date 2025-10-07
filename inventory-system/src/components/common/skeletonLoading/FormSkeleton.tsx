import React from 'react';
import Skeleton from './Skeleton';

interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
  showButtons?: boolean;
  className?: string;
}

const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 6,
  showTitle = true,
  showButtons = true,
  className = ''
}) => {
  return (
    <div className={`form-skeleton ${className}`}>
      <div className="modal-overlay">
        <div className="modal-content product-form-modal">
          {showTitle && (
            <div className="modal-header">
              <Skeleton height="24px" width="200px" />
              <Skeleton height="24px" width="24px" variant="circular" />
            </div>
          )}
          
          <div className="product-form">
            {/* Form rows */}
            {Array.from({ length: Math.ceil(fields / 2) }).map((_, rowIndex) => (
              <div key={rowIndex} className="form-row">
                <div className="form-group">
                  <Skeleton height="14px" width="80px" className="form-label-skeleton" />
                  <Skeleton height="42px" width="100%" borderRadius="8px" />
                </div>
                {rowIndex * 2 + 1 < fields && (
                  <div className="form-group">
                    <Skeleton height="14px" width="60px" className="form-label-skeleton" />
                    <Skeleton height="42px" width="100%" borderRadius="8px" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Description field */}
            <div className="form-group">
              <Skeleton height="14px" width="70px" className="form-label-skeleton" />
              <Skeleton height="80px" width="100%" borderRadius="8px" />
            </div>
            
            {/* Checkbox */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <Skeleton height="16px" width="16px" variant="rectangular" />
                <Skeleton height="14px" width="100px" />
              </div>
            </div>
            
            {showButtons && (
              <div className="modal-actions">
                <Skeleton height="40px" width="80px" borderRadius="6px" />
                <Skeleton height="40px" width="120px" borderRadius="6px" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSkeleton;
