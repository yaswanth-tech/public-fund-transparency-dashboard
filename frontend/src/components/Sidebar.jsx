import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  UploadCloud,
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react';
import { NAV_ITEMS } from '../utils/constants';

const ICON_MAP = {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  UploadCloud,
  FileSpreadsheet
};

export const Sidebar = ({ isMobileMenuOpen, closeMobileMenu }) => {
  return (
    <>
      {isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={closeMobileMenu} />
      )}

      <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
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
              <span>Civic Transparency</span>
            </div>
            <p className="text-xs text-slate-500 leading-snug">
              Providing public accountability & ward-level spending oversight.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
