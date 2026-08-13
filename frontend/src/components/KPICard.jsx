import React from 'react';
import { formatCurrency, formatFullCurrency } from '../utils/formatters';

export const KPICard = ({
  title,
  value,
  isCurrency = true,
  isPercent = false,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue'
}) => {
  let formattedValue = value;
  let fullValueTooltip = '';

  if (isCurrency) {
    formattedValue = formatCurrency(value);
    fullValueTooltip = formatFullCurrency(value);
  } else if (isPercent) {
    formattedValue = `${Number(value || 0).toFixed(1)}%`;
  } else if (typeof value === 'number') {
    formattedValue = value.toLocaleString('en-IN');
  }

  return (
    <div className={`kpi-card kpi-card-${colorScheme}`} title={fullValueTooltip}>
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        {Icon && (
          <div className="kpi-card-icon">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="kpi-card-body">
        <div className="kpi-card-value">{formattedValue}</div>
        {subtitle && <p className="kpi-card-subtitle">{subtitle}</p>}
      </div>
      {trend && (
        <div className="kpi-card-footer">
          <span className={`kpi-trend ${trend.type || 'neutral'}`}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
