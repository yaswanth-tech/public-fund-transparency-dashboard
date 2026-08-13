import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  title = "No civic spending records found",
  message = "There are no records matching your current filter criteria or dataset.",
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrapper">
        <FolderOpen className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
