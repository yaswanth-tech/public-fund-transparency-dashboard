import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Wards from './pages/Wards';
import WardDetails from './pages/WardDetails';
import Oversight from './pages/Oversight';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import Login from './pages/Login';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('civic_auth') === 'true'
  );

  const handleLoginSuccess = () => {
    localStorage.setItem('civic_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('civic_auth');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

        <Route
          path="*"
          element={
            <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wards" element={<Wards />} />
                <Route path="/wards/:wardName" element={<WardDetails />} />
                <Route path="/oversight" element={<Oversight />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
