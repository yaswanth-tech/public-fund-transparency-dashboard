import React from 'react';
import { PROJECT_STATUS_COLORS } from '../utils/constants';

export const StatusBadge = ({ status }) => {
  const style = PROJECT_STATUS_COLORS[status] || PROJECT_STATUS_COLORS.Planned;

  return (
    <span
      className="badge-container"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: 'transparent'
      }}
    >
      <span className="badge-dot" style={{ backgroundColor: style.dot }} />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
