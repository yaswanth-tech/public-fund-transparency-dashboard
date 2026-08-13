import React from 'react';
import { STATUS_COLORS } from '../utils/constants';

export const UtilizationBadge = ({ flag, value }) => {
  const statusKey = flag || (value < 50 ? 'Critical' : value < 70 ? 'Low' : 'Normal');
  const style = STATUS_COLORS[statusKey] || STATUS_COLORS.Normal;

  return (
    <span
      className="badge-container"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      <span className="badge-dot" style={{ backgroundColor: style.badge }} />
      {statusKey === 'Critical' && 'CRITICAL'}
      {statusKey === 'Low' && 'LOW'}
      {statusKey === 'Normal' && 'NORMAL'}
      {value !== undefined && value !== null && ` (${Number(value).toFixed(1)}%)`}
    </span>
  );
};

export default UtilizationBadge;
