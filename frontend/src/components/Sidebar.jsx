import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  UploadCloud,
  FileSpreadsheet,
  HelpCircle,
  Lock
} from 'lucide-react';
import { NAV_ITEMS } from '../utils/constants';

const ICON_MAP = {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  UploadCloud,
  FileSpreadsheet
};

export const Sidebar = ({ isMobileMenuOpen, closeMobileMenu, userRole = 'Citizen' }) => {
  // Filter visible items based on user role
  const isItemAllowed = (itemPath) => {
    if (userRole === 'Oversight Officer') return true; // Full Access
    if (userRole === 'Staff Member') {
      return itemPath !== '/oversight'; // Can upload data & view dashboard/wards/reports
    }
    // Citizen Access: Only public views
    return itemPath === '/dashboard' || itemPath === '/wards' || itemPath === '/reports';
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={closeMobileMenu} />
      )}

      <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation ({userRole})</div>
          {NAV_ITEMS.map((item) => {
            const allowed = isItemAllowed(item.path);
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;

            if (!allowed) {
              return (
                <div
                  key={item.path}
                  className="nav-item opacity-40 cursor-not-allowed text-slate-400 flex items-center justify-between select-none"
                  title={`Requires Staff or Oversight Officer login to access ${item.label}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="nav-icon text-slate-400" />
                    <span className="nav-label">{item.label}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-help-card">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 mb-1">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Role Permissions</span>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              Active: <strong className="text-slate-800">{userRole}</strong>.
              {userRole === 'Citizen' && ' Switch role to test Staff data ingestion or Officer oversight.'}
              {userRole === 'Staff Member' && ' Granted CSV Data Ingestion privileges.'}
              {userRole === 'Oversight Officer' && ' Granted Full Administrative Oversight access.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
