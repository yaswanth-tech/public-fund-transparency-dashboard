import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

export const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@civicfunds.local');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-badge">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <h2 className="login-title">{APP_NAME}</h2>
          <p className="login-subtitle">{APP_TAGLINE} • Staff Access</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Official Email Address</label>
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
            Sign In to Staff Portal <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        <div className="login-footer">
          <div className="login-demo-pill">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            <span>Demo Credentials Pre-filled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
