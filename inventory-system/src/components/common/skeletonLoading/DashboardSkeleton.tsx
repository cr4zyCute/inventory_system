import React from 'react';
import Skeleton from './Skeleton';

interface DashboardSkeletonProps {
  showStats?: boolean;
  showModules?: boolean;
  showActivities?: boolean;
  className?: string;
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  showStats = true,
  showModules = true,
  showActivities = true,
  className = ''
}) => {
  return (
    <div className={`dashboard-skeleton ${className}`}>
      {showStats && (
        <section className="stats-section">
          <Skeleton height="32px" width="200px" className="section-title-skeleton" />
          <div className="stats-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  <Skeleton height="24px" width="24px" variant="circular" />
                </div>
                <div className="stat-content">
                  <Skeleton height="28px" width="60px" />
                  <Skeleton height="16px" width="80px" />
                  <Skeleton height="14px" width="40px" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showModules && (
        <section className="modules-section">
          <Skeleton height="32px" width="180px" className="section-title-skeleton" />
          <div className="modules-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="module-card">
                <div className="module-header">
                  <Skeleton height="24px" width="24px" variant="circular" />
                  <Skeleton height="8px" width="8px" variant="circular" />
                </div>
                <Skeleton height="20px" width="70%" />
                <Skeleton height="14px" width="90%" />
                <Skeleton height="14px" width="60%" />
                <Skeleton height="32px" width="80px" borderRadius="6px" />
              </div>
            ))}
          </div>
        </section>
      )}

      {showActivities && (
        <section className="activities-section">
          <Skeleton height="32px" width="160px" className="section-title-skeleton" />
          <div className="activities-list">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="activity-item">
                <div className="activity-type">
                  <Skeleton height="16px" width="16px" variant="circular" />
                </div>
                <div className="activity-content">
                  <Skeleton height="16px" width="80%" />
                  <Skeleton height="12px" width="40%" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardSkeleton;
