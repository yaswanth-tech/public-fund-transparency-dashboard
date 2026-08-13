import React from 'react';

export const LoadingSpinner = ({ label = "Loading data from backend..." }) => {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p className="loading-label">{label}</p>
    </div>
  );
};

export const SkeletonKPI = () => (
  <div className="skeleton-card">
    <div className="skeleton-line skeleton-title" />
    <div className="skeleton-line skeleton-value" />
    <div className="skeleton-line skeleton-subtitle" />
  </div>
);

export const SkeletonChart = () => (
  <div className="skeleton-card skeleton-chart">
    <div className="skeleton-line skeleton-title" />
    <div className="skeleton-box" />
  </div>
);

export default LoadingSpinner;
