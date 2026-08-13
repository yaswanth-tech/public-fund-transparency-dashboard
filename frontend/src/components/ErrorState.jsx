import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = "Unable to connect to the Civic Fund API.",
  message = "Make sure the FastAPI backend is running on port 8000 (http://127.0.0.1:8000).",
  onRetry
}) => {
  return (
    <div className="error-card">
      <div className="error-icon-wrapper">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary mt-4">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorState;
