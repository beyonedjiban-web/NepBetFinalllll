
import React from 'react';
import { AppProvider, useAppStore, RouterProvider, useLocation, Navigate } from './services/store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Admin from './pages/Admin';
import GameCrash from './pages/GameCrash';
import GameMines from './pages/GameMines';
import GameDice from './pages/GameDice';
import GameCrystals from './pages/GameCrystals';
import GameSolitra from './pages/GameSolitra';
import GameVampireCrush from './pages/GameVampireCrush';
import AuthModal from './components/AuthModal';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppStore();
  if (isLoading) return <div className="p-10 text-white text-center">Loading NepBet...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { pathname } = useLocation();

  return (
    <Layout>
      {pathname === '/' && <Home />}
      {pathname === '/auth' && <AuthModal />}
      {pathname === '/support' && <Support />}
      
      {pathname === '/admin' && (
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      )}

      {pathname === '/wallet' && (
        <ProtectedRoute>
          <Wallet />
        </ProtectedRoute>
      )}
      
      {pathname === '/profile' && (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      )}
      
      {pathname === '/game/crash' && (
        <ProtectedRoute>
          <GameCrash />
        </ProtectedRoute>
      )}

      {pathname === '/game/mines' && (
        <ProtectedRoute>
          <GameMines />
        </ProtectedRoute>
      )}
      
      {pathname === '/game/dice_7' && (
        <ProtectedRoute>
          <GameDice />
        </ProtectedRoute>
      )}

      {pathname === '/game/crystals' && (
        <ProtectedRoute>
          <GameCrystals />
        </ProtectedRoute>
      )}

      {pathname === '/game/solitra' && (
        <ProtectedRoute>
          <GameSolitra />
        </ProtectedRoute>
      )}

      {pathname === '/game/vampire' && (
        <ProtectedRoute>
          <GameVampireCrush />
        </ProtectedRoute>
      )}

      {!['/', '/auth', '/wallet', '/profile', '/support', '/admin', '/game/crash', '/game/mines', '/game/dice_7', '/game/crystals', '/game/solitra', '/game/vampire'].includes(pathname) && (
         <Home />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AppProvider>
  );
};

export default App;
