export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const APP_NAME = 'Civic Fund Transparency';
export const APP_TAGLINE = 'Public Spending Intelligence';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Wards', path: '/wards', icon: 'Building2' },
  { label: 'Oversight', path: '/oversight', icon: 'ShieldAlert' },
  { label: 'Upload Data', path: '/upload', icon: 'UploadCloud' },
  { label: 'Reports', path: '/reports', icon: 'FileSpreadsheet' }
];

export const UTILIZATION_THRESHOLDS = {
  CRITICAL: 50,
  LOW: 70
};

export const STATUS_COLORS = {
  Critical: {
    bg: '#FEF2F2',
    text: '#991B1B',
    border: '#FCA5A5',
    badge: '#EF4444'
  },
  Low: {
    bg: '#FFFBEB',
    text: '#92400E',
    border: '#FDE68A',
    badge: '#F59E0B'
  },
  Normal: {
    bg: '#ECFDF5',
    text: '#065F46',
    border: '#6EE7B7',
    badge: '#10B981'
  }
};

export const PROJECT_STATUS_COLORS = {
  Completed: { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  'In Progress': { bg: '#EFF6FF', text: '#1E40AF', dot: '#3B82F6' },
  Planned: { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  Delayed: { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' }
};
