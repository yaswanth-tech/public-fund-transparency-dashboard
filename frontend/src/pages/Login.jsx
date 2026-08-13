import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Lock, Mail, ArrowRight, ShieldAlert, UserCheck, Users, KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

export const Login = ({ onLoginSuccess, currentRole = 'Citizen' }) => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Staff Member');
  const [email, setEmail] = useState('staff@civic.gov.in');
  const [password, setPassword] = useState('staff123');

  // OTP State
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP Verification
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(1);
    setOtpError('');
    setOtpSentNotice(false);
    setUserOtp('');

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

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) return;

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setStep(2);
    setOtpSentNotice(true);
    setOtpError('');
    setUserOtp('');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (userOtp.trim() === generatedOtp) {
      setOtpError('');
      if (onLoginSuccess) {
        onLoginSuccess(selectedRole, email);
      }
      navigate('/dashboard');
    } else {
      setOtpError('Invalid OTP Code. Please enter the 6-digit code shown above.');
    }
  };

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpSentNotice(true);
    setOtpError('');
    setUserOtp('');
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
          <p className="login-subtitle">{APP_TAGLINE} • Secure Portal</p>
        </div>

        {/* 3-Role Selector Tabs */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block text-center">
            Select Access Role
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
              <span className="text-[10px] text-slate-400">2FA Protected</span>
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
              <span className="text-[10px] text-slate-400">2FA Protected</span>
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
                No login or OTP required. Citizens have open access to city budget allocations, ward ratings, and downloadable public spending disclosure reports.
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
        ) : step === 1 ? (
          /* STEP 1: Enter Official Email & Credentials */
          <form onSubmit={handleSendOtp} className="login-form space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>2-Factor Security:</strong> An official OTP will be generated and verified for your email account before granting access.
              </span>
            </div>

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
              <label className="form-label">Password / Account Pin</label>
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

            <button
              type="submit"
              className="btn btn-primary w-full py-3 font-bold flex items-center justify-center space-x-2"
            >
              <span>Generate Security OTP</span>
              <KeyRound className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: Enter 6-Digit Security OTP */
          <form onSubmit={handleVerifyOtp} className="login-form space-y-4">
            {otpSentNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Security OTP Generated!</span>
                </div>
                <p>
                  Sent to <strong className="font-mono text-emerald-950">{email}</strong>:
                </p>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-center text-xl tracking-widest font-extrabold rounded-lg shadow-inner border border-slate-800 select-all">
                  {generatedOtp}
                </div>
              </div>
            )}

            {otpError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label text-center block">Enter 6-Digit OTP Code</label>
              <div className="input-with-icon">
                <KeyRound className="input-icon" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="form-input text-center font-mono text-lg tracking-widest font-bold"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 underline font-medium"
              >
                ← Back to Email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend New OTP
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full py-3 font-bold bg-emerald-600 hover:bg-emerald-700 border-none text-white flex items-center justify-center space-x-2"
            >
              <span>Verify OTP & Authorize Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
