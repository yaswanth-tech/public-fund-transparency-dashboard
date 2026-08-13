import React from 'react';

export const StatCard = ({ label, value, icon: Icon, badge, color = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-left">
        {Icon && (
          <div className="stat-card-icon">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="stat-card-label">{label}</p>
          <h4 className="stat-card-value">{value}</h4>
        </div>
      </div>
      {badge && <div className="stat-card-badge">{badge}</div>}
    </div>
  );
};

export default StatCard;
