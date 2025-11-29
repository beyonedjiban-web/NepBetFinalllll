
import React, { useState } from 'react';
import { useAppStore, useNavigate } from '../services/store';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const AuthModal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false); // Default to Signup as per request
  const [formData, setFormData] = useState({ phone: '', email: '', password: '', name: '' });
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login, register, authError } = useAppStore();
  const navigate = useNavigate();

  const validatePhone = (phone: string) => {
    // Basic Nepal mobile validation (starts with 98 or 97, 10 digits)
    const regex = /^(98|97)\d{8}$/;
    return regex.test(phone);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!validatePhone(formData.phone)) {
        setLocalError('Invalid Mobile Number. Must start with 98 or 97 and be 10 digits.');
        return;
    }

    if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
    }

    const success = register(formData.name, formData.phone, formData.email, formData.password);
    
    if (success) {
        setSuccessMsg('Registration successful! Please login with your credentials.');
        setIsLogin(true); // Switch to login view
        // Pre-fill identifier for convenience
        setLoginData(prev => ({ ...prev, identifier: formData.phone })); 
        setFormData({ phone: '', email: '', password: '', name: '' }); // Clear sensitive data
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!loginData.identifier || !loginData.password) {
        setLocalError('Please fill in all fields.');
        return;
    }

    const success = login(loginData.identifier, loginData.password);
    if (success) {
        navigate('/wallet');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 text-sm">
            {isLogin ? 'Enter your credentials to access your wallet' : 'Join NepBet and start winning today'}
        </p>
      </div>

      {(localError || authError) && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-2 text-red-400 text-sm">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{localError || authError}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3 mb-4 flex items-start gap-2 text-emerald-400 text-sm">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
        </div>
      )}
      
      {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mobile or Email</label>
                <input 
                    type="text"
                    required
                    placeholder="98XXXXXXXX or user@example.com"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
                <input 
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/50 mt-2 transition-all transform active:scale-95">
                Log In
            </button>
          </form>
      ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mobile Number</label>
                <input 
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
                <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/50 mt-2 transition-all transform active:scale-95">
                Create Account
            </button>
          </form>
      )}

      <div className="mt-8 pt-6 border-t border-slate-700 text-center">
        <button 
            onClick={() => {
                setIsLogin(!isLogin);
                setLocalError('');
                setSuccessMsg('');
            }}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
            {isLogin ? (
                <>New to NepBet? <span className="text-emerald-400">Sign Up Now</span></>
            ) : (
                <>Already have an account? <span className="text-emerald-400">Log In</span></>
            )}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
