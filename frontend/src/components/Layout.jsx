import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export const Layout = ({ children, userRole, userEmail, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userRole={userRole}
        userEmail={userEmail}
        onLogout={onLogout}
      />
      <div className="layout-body">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
          userRole={userRole}
        />
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
          <footer className="app-footer">
            <div className="footer-content">
              <p>© {new Date().getFullYear()} Civic Fund Utilization & Transparency Platform. Open Data Public Service.</p>
              <p className="text-xs text-slate-400">Connected to FastAPI Backend Engine • User Access Level: <strong className="text-slate-600">{userRole}</strong></p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
