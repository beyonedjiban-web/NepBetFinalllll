
import React, { useState } from 'react';
import { Link, useLocation } from '../services/store';
import { useAppStore } from '../services/store';
import { 
  HomeIcon, 
  WalletIcon, 
  UserIcon, 
  Bars3Icon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';
import SupportChat from './SupportChat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAppStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Casino', path: '/', icon: <HomeIcon className="w-6 h-6" /> },
    { name: 'Wallet', path: '/wallet', icon: <WalletIcon className="w-6 h-6" /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon className="w-6 h-6" /> },
    { name: 'Support', path: '/support', icon: <QuestionMarkCircleIcon className="w-6 h-6" /> },
  ];

  if (user?.isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: <ShieldCheckIcon className="w-6 h-6 text-yellow-400" /> });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-700/80 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link to="/" className="text-xl md:text-2xl font-black italic tracking-wider flex items-center gap-1 hover:opacity-90 transition-opacity">
              <span className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">NEP</span>
              <span className="text-white">BET</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6 bg-slate-800/50 px-6 py-2 rounded-full border border-slate-700/50">
            {navItems.map((item) => (
               <Link 
                key={item.name}
                to={item.path} 
                className={`flex items-center gap-2 text-sm font-bold transition-all px-3 py-1.5 rounded-lg ${
                  location.pathname === item.path 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
               >
                 {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
                 {item.name}
               </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {!user.isAdmin && (
                    <div className="hidden sm:flex flex-col items-end leading-tight">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Balance</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">NPR {user.balance.toFixed(2)}</span>
                    </div>
                )}
                {user.isAdmin ? (
                    <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">Logout</button>
                ) : (
                    <Link to="/wallet" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-emerald-900/50 active:scale-95">
                        + Deposit
                    </Link>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/auth" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-emerald-900/50 transition-all active:scale-95">
                  Login / Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar (still useful for extra settings or specific users, but less critical now) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-slate-900 h-full shadow-2xl flex flex-col p-6 animate-slide-in-right border-r border-slate-800">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
               <span className="text-2xl font-black text-emerald-500 italic">NEPBET</span>
               <button onClick={() => setSidebarOpen(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            
            {isAuthenticated && user && !user.isAdmin && (
                <div className="bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Balance</div>
                    <div className="text-2xl font-black text-emerald-400">NPR {user.balance.toFixed(2)}</div>
                </div>
            )}

            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-bold ${
                    location.pathname === item.path ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>

            {isAuthenticated ? (
               <button 
                  onClick={() => { logout(); setSidebarOpen(false); }}
                  className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors font-bold border border-red-500/20"
                >
                  Sign Out
                </button>
            ) : (
                <Link 
                    to="/auth"
                    onClick={() => setSidebarOpen(false)}
                    className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-slate-800 hover:bg-slate-700 transition-colors font-bold"
                >
                    Log In / Sign Up
                </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {/* Added pb-24 to ensure content is not hidden behind the mobile bottom nav */}
      <main className="flex-1 container mx-auto px-3 py-4 md:px-4 md:py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Dock) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 lg:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                   isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`transition-all duration-200 ${isActive ? '-translate-y-1' : ''}`}>
                    {item.icon}
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-emerald-400 rounded-full absolute bottom-2"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <SupportChat />
    </div>
  );
};

export default Layout;
