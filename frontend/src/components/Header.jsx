import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Menu, X, LogOut } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

export const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

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

          <div className="status-indicator-pill">
            <span className="pulse-dot" />
            <span>Live Data Updated</span>
          </div>
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-info">
                <span className="user-badge">STAFF</span>
                <span className="user-email">admin@civicfunds.local</span>
              </div>
              <button
                onClick={onLogout}
                className="btn btn-ghost btn-sm"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline ml-1">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
            >
              Staff Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
