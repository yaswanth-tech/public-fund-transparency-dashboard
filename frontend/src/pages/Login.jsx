import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Lock, Mail, ArrowRight, ShieldAlert, UserCheck, Users, Check } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

export const Login = ({ onLoginSuccess, currentRole = 'Citizen' }) => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Staff Member');
  const [email, setEmail] = useState('staff@civic.gov.in');
  const [password, setPassword] = useState('staff123');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'Oversight Officer') {
      setEmail('officer@oversight.gov.in');
      setPassword('officer123');
    } else if (role === 'Staff Member') {
      setEmail('staff@civic.gov.in');
      setPassword('staff123');
    } else {
      setEmail('citizen@public.org');
      setPassword('public');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess(selectedRole, email);
    }
    navigate('/dashboard');
  };

  const handleCitizenDirect = () => {
    if (onLoginSuccess) {
      onLoginSuccess('Citizen', 'citizen@public.org');
    }
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      <div className="login-card max-w-lg">
        <div className="login-header">
          <div className="login-logo-badge">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h2 className="login-title">{APP_NAME}</h2>
          <p className="login-subtitle">{APP_TAGLINE} • Role Access Portal</p>
        </div>

        {/* 3-Role Selector Tabs */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block text-center">
            Select Your Access Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('Citizen')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                selectedRole === 'Citizen'
                  ? 'border-teal-500 bg-teal-50/80 text-teal-900 ring-2 ring-teal-500/20 font-bold'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Users className={`w-5 h-5 mb-1 ${selectedRole === 'Citizen' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold">Citizen</span>
              <span className="text-[10px] text-slate-400">Public Read</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('Staff Member')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                selectedRole === 'Staff Member'
                  ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <UserCheck className={`w-5 h-5 mb-1 ${selectedRole === 'Staff Member' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold">Staff</span>
              <span className="text-[10px] text-slate-400">Data Entry</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('Oversight Officer')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                selectedRole === 'Oversight Officer'
                  ? 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ShieldAlert className={`w-5 h-5 mb-1 ${selectedRole === 'Oversight Officer' ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold">Oversight</span>
              <span className="text-[10px] text-slate-400">Admin Control</span>
            </button>
          </div>
        </div>

        {selectedRole === 'Citizen' ? (
          <div className="space-y-4">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-teal-800">
                <Users className="w-4 h-4 text-teal-600" /> Public Citizen Mode Enabled
              </p>
              <p>
                No password required. Citizens have open access to city budget allocations, ward ratings, and downloadable public spending disclosure reports.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCitizenDirect}
              className="btn btn-primary w-full py-3 bg-teal-600 hover:bg-teal-700 border-none text-white font-bold"
            >
              Enter Dashboard as Citizen <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">
                {selectedRole === 'Oversight Officer' ? 'Oversight Officer Email' : 'Department Staff Email'}
              </label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.gov"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn">
              Sign In as {selectedRole} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>
        )}

        <div className="login-footer">
          <div className="login-demo-pill">
            <Check className="w-4 h-4 text-emerald-600 mr-1.5" />
            <span>Pre-configured Demo Credentials for Presentation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
