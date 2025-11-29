
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, TransactionType, TransactionStatus, GameSession, KycDetails, SupportTicket } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  transactions: Transaction[];
  gameHistory: GameSession[];
  tickets: SupportTicket[];
  login: (identifier: string, password: string) => boolean;
  register: (name: string, phone: string, email: string, password: string) => boolean;
  logout: () => void;
  deposit: (amount: number, method: string, senderNumber: string, senderName: string, screenshot: string) => void;
  withdraw: (amount: number, walletNumber: string, method: string) => boolean;
  placeBet: (amount: number) => boolean; 
  handleGameWin: (winAmount: number, gameType: any, multiplier: number) => void; 
  addGameResult: (winAmount: number, betAmount: number, gameType: any, multiplier: number) => void;
  updateKyc: (details: KycDetails) => void;
  
  // Admin Functions
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  getAllUsers: () => User[];
  createTicket: (subject: string, message: string, priority: string) => void;

  isLoading: boolean;
  authError: string | null;
}

const AppContext = createContext<AppState | undefined>(undefined);

// --- Custom Router Implementation ---
const RouterContext = createContext<{
  path: string;
  navigate: (path: string) => void;
}>({ path: '/', navigate: () => {} });

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onHashChange = () => {
      const p = window.location.hash.slice(1);
      setPath(p || '/');
    };
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useLocation = () => {
  const { path } = useContext(RouterContext);
  return { pathname: path };
};

export const useNavigate = () => {
  const { navigate } = useContext(RouterContext);
  return (to: string) => navigate(to);
};

export const Link: React.FC<{ to: string, children: ReactNode, className?: string, onClick?: () => void }> = ({ to, children, className, onClick }) => {
  const { navigate } = useContext(RouterContext);
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        if (onClick) onClick();
      }}
    >
      {children}
    </a>
  );
};

export const Navigate: React.FC<{ to: string }> = ({ to }) => {
  const { navigate } = useContext(RouterContext);
  useEffect(() => {
    navigate(to);
  }, [to, navigate]);
  return null;
};
// ------------------------------------

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const getRegisteredUsers = () => {
    try {
      const users = localStorage.getItem('nepbet_users');
      return users ? JSON.parse(users) : [];
    } catch (e) {
      return [];
    }
  };

  const getStoredTransactions = () => {
    try {
      const txs = localStorage.getItem('nepbet_transactions');
      return txs ? JSON.parse(txs) : [];
    } catch (e) {
      return [];
    }
  };

  const saveTransactions = (txs: Transaction[]) => {
    localStorage.setItem('nepbet_transactions', JSON.stringify(txs));
    setTransactions(txs);
  };

  const saveTickets = (tks: SupportTicket[]) => {
    localStorage.setItem('nepbet_tickets', JSON.stringify(tks));
    setTickets(tks);
  };

  // Initial Load
  useEffect(() => {
    const sessionStr = localStorage.getItem('nepbet_session');
    
    // Load Global Data (Transactions & Tickets) for persistent admin view
    const savedTxs = getStoredTransactions();
    setTransactions(savedTxs);
    
    const savedTickets = localStorage.getItem('nepbet_tickets');
    if (savedTickets) setTickets(JSON.parse(savedTickets));

    if (sessionStr) {
      try {
        const sessionUser = JSON.parse(sessionStr);
        if (sessionUser.isAdmin) {
             setUser(sessionUser);
             setIsAuthenticated(true);
        } else {
            const users = getRegisteredUsers();
            const freshUser = users.find((u: any) => u.id === sessionUser.id);

            if (freshUser) {
              const { password, ...safeUser } = freshUser;
              setUser(safeUser);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem('nepbet_session');
            }
        }
      } catch (e) {
        localStorage.removeItem('nepbet_session');
      }
    }
    setIsLoading(false);
  }, []);

  const updateBalance = (delta: number) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newBalance = Number((prevUser.balance + delta).toFixed(2));
      
      const updatedUser = { ...prevUser, balance: newBalance };
      localStorage.setItem('nepbet_session', JSON.stringify(updatedUser)); // Update Session

      const users = getRegisteredUsers();
      const userIndex = users.findIndex((u: any) => u.id === prevUser.id);
      if (userIndex !== -1) {
        users[userIndex].balance = newBalance;
        localStorage.setItem('nepbet_users', JSON.stringify(users));
      }
      
      return updatedUser;
    });
  };

  const register = (name: string, phone: string, email: string, password: string) => {
    setAuthError(null);
    const users = getRegisteredUsers();
    const storedTxs = getStoredTransactions();

    if (users.some((u: any) => u.phone === phone)) {
      setAuthError('Mobile number already registered.');
      return false;
    }
    if (users.some((u: any) => u.email === email)) {
      setAuthError('Email already registered.');
      return false;
    }

    // SEQUENTIAL ID GENERATION (Starts at 1001)
    // We check BOTH registered users AND transaction history to find the highest used ID.
    // This prevents ID collisions even if the user database is cleared but transactions remain.
    const userIds = users.map((u: any) => parseInt(u.id)).filter((n: number) => !isNaN(n));
    const txUserIds = storedTxs.map((t: any) => parseInt(t.userId)).filter((n: number) => !isNaN(n));
    
    const allUsedIds = new Set([...userIds, ...txUserIds]);
    
    let newId = 1001;
    if (allUsedIds.size > 0) {
        newId = Math.max(...Array.from(allUsedIds)) + 1;
    }

    const newUser = {
      id: newId.toString(),
      name,
      phone,
      email,
      password,
      balance: 0, 
      isAdmin: false,
      kyc: undefined
    };

    users.push(newUser);
    localStorage.setItem('nepbet_users', JSON.stringify(users));
    return true;
  };

  const login = (identifier: string, password: string) => {
    setAuthError(null);
    
    // Check Admin
    if (identifier === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
            id: 'admin',
            name: 'Administrator',
            email: 'admin@nepbet.com',
            phone: '0000000000',
            balance: 0,
            isAdmin: true
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('nepbet_session', JSON.stringify(adminUser));
        return true;
    }

    const users = getRegisteredUsers();
    const foundUser = users.find((u: any) => 
      (u.email === identifier || u.phone === identifier) && u.password === password
    );

    if (foundUser) {
      const { password, ...safeUser } = foundUser;
      setUser(safeUser);
      setIsAuthenticated(true);
      localStorage.setItem('nepbet_session', JSON.stringify(safeUser));
      return true;
    } else {
      setAuthError('Invalid credentials.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setGameHistory([]);
    localStorage.removeItem('nepbet_session');
  };

  const deposit = (amount: number, method: string, senderNumber: string, senderName: string, screenshot: string) => {
    if (!user) return;
    
    // Create PENDING transaction
    const newTx: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      type: TransactionType.DEPOSIT,
      amount,
      date: new Date().toISOString(),
      status: TransactionStatus.PENDING,
      method,
      senderNumber,
      senderName,
      screenshot
    };
    
    saveTransactions([newTx, ...transactions]);
  };

  const withdraw = (amount: number, walletNumber: string, method: string): boolean => {
    if (!user || user.balance < amount) return false;

    const newTx: Transaction = {
      id: Date.now().toString(),
      userId: user.id,
      type: TransactionType.WITHDRAWAL,
      amount,
      date: new Date().toISOString(),
      status: TransactionStatus.PENDING,
      details: `To: ${walletNumber}`,
      method: method
    };

    saveTransactions([newTx, ...transactions]);
    updateBalance(-amount);
    return true;
  };

  const placeBet = (amount: number): boolean => {
    if (!user || user.balance < amount) return false;
    updateBalance(-amount);
    return true;
  };

  const handleGameWin = (winAmount: number, gameType: any, multiplier: number) => {
    if (!user) return;
    if (winAmount > 0) {
      updateBalance(winAmount);
    }
    const session: GameSession = {
      id: Date.now().toString(),
      gameType,
      betAmount: 0,
      winAmount,
      multiplier,
      timestamp: new Date().toISOString()
    };
    setGameHistory(prev => [session, ...prev]);
  };

  const addGameResult = (winAmount: number, betAmount: number, gameType: any, multiplier: number) => {
    if (!user) return;
    const profit = winAmount - betAmount;
    updateBalance(profit);
  };

  const updateKyc = (details: KycDetails) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, kyc: details };
      localStorage.setItem('nepbet_session', JSON.stringify(updatedUser)); // Update Session

      const users = getRegisteredUsers();
      const userIndex = users.findIndex((u: any) => u.id === prev.id);
      if (userIndex !== -1) {
        users[userIndex].kyc = details;
        localStorage.setItem('nepbet_users', JSON.stringify(users));
      }
      return updatedUser;
    });
  };

  // --- ADMIN FUNCTIONS ---

  const getAllUsers = () => getRegisteredUsers();

  const approveTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status !== TransactionStatus.PENDING) return;

    // Update Status
    const updatedTxs = transactions.map(t => 
        t.id === id ? { ...t, status: TransactionStatus.COMPLETED } : t
    );
    saveTransactions(updatedTxs);

    // If Deposit, Add Balance to TARGET USER
    if (tx.type === TransactionType.DEPOSIT) {
        const users = getRegisteredUsers();
        const userIndex = users.findIndex((u: any) => u.id === tx.userId);
        if (userIndex !== -1) {
            users[userIndex].balance = Number((users[userIndex].balance + tx.amount).toFixed(2));
            localStorage.setItem('nepbet_users', JSON.stringify(users));
        }
        
        // If logged in as that user, update UI
        if (user && user.id === tx.userId) {
            setUser(prev => prev ? ({ ...prev, balance: prev.balance + tx.amount }) : null);
        }
    }
  };

  const rejectTransaction = (id: string) => {
      const tx = transactions.find(t => t.id === id);
      if (!tx || tx.status !== TransactionStatus.PENDING) return;

      const updatedTxs = transactions.map(t => 
          t.id === id ? { ...t, status: TransactionStatus.FAILED } : t
      );
      saveTransactions(updatedTxs);

      // If Withdrawal rejection, refund the amount
      if (tx.type === TransactionType.WITHDRAWAL) {
          const users = getRegisteredUsers();
          const userIndex = users.findIndex((u: any) => u.id === tx.userId);
          if (userIndex !== -1) {
              users[userIndex].balance = Number((users[userIndex].balance + tx.amount).toFixed(2));
              localStorage.setItem('nepbet_users', JSON.stringify(users));
          }
          if (user && user.id === tx.userId) {
             setUser(prev => prev ? ({ ...prev, balance: prev.balance + tx.amount }) : null);
          }
      }
  };

  const createTicket = (subject: string, message: string, priority: string) => {
    if (!user) return;
    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      subject,
      message,
      priority,
      status: 'OPEN',
      date: new Date().toISOString()
    };
    saveTickets([newTicket, ...tickets]);
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      isAuthenticated, 
      transactions, 
      gameHistory, 
      tickets,
      login, 
      register,
      logout, 
      deposit, 
      withdraw, 
      placeBet,
      handleGameWin,
      addGameResult,
      updateKyc,
      approveTransaction,
      rejectTransaction,
      getAllUsers,
      createTicket,
      isLoading,
      authError
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
