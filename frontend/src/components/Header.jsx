import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Menu, X, LogOut, UserCheck, ShieldAlert, Users } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

export const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen, userRole, userEmail, onLogout }) => {
  const navigate = useNavigate();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Oversight Officer':
        return { label: 'OVERSIGHT OFFICER', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldAlert };
      case 'Staff Member':
        return { label: 'STAFF MEMBER', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: UserCheck };
      default:
        return { label: 'PUBLIC CITIZEN', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: Users };
    }
  };

  const badgeInfo = getRoleBadgeStyle(userRole);
  const BadgeIcon = badgeInfo.icon;

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/dashboard" className="brand-logo">
            <div className="logo-icon-bg">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div className="brand-text">
              <span className="brand-title">{APP_NAME}</span>
              <span className="brand-subtitle">{APP_TAGLINE}</span>
            </div>
          </Link>

          <div className="status-indicator-pill hidden md:flex">
            <span className="pulse-dot" />
            <span>Live Civic Data</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-profile-menu">
            <div className="user-info">
              <span className={`user-badge border px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 ${badgeInfo.bg}`}>
                <BadgeIcon className="w-3 h-3" />
                {badgeInfo.label}
              </span>
              <span className="user-email">{userEmail}</span>
            </div>

            {userRole !== 'Citizen' ? (
              <button
                onClick={() => {
                  onLogout();
                  navigate('/dashboard');
                }}
                className="btn btn-ghost btn-sm text-slate-300 hover:text-white"
                title="Switch Role / Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Switch Role</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-sm"
              >
                Role Portal Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
