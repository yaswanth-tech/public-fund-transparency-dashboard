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
  const [userRole, setUserRole] = useState(
    () => localStorage.getItem('civic_user_role') || 'Citizen'
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem('civic_user_email') || 'citizen@public.org'
  );

  const handleLoginSuccess = (role, email) => {
    localStorage.setItem('civic_user_role', role);
    localStorage.setItem('civic_user_email', email);
    setUserRole(role);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.setItem('civic_user_role', 'Citizen');
    localStorage.setItem('civic_user_email', 'citizen@public.org');
    setUserRole('Citizen');
    setUserEmail('citizen@public.org');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={handleLoginSuccess}
              currentRole={userRole}
            />
          }
        />

        <Route
          path="*"
          element={
            <Layout
              userRole={userRole}
              userEmail={userEmail}
              onLogout={handleLogout}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
                <Route path="/wards" element={<Wards userRole={userRole} />} />
                <Route path="/wards/:wardName" element={<WardDetails userRole={userRole} />} />
                <Route path="/oversight" element={<Oversight userRole={userRole} />} />
                <Route path="/upload" element={<Upload userRole={userRole} />} />
                <Route path="/reports" element={<Reports userRole={userRole} />} />
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
