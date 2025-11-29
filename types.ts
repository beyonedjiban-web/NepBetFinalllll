
export enum GameType {
  CRASH = 'CRASH',
  MINES = 'MINES',
  DICE_7 = 'DICE_7', // Over Under 7
  CRYSTALS = 'CRYSTALS',
  SOLITRA = 'SOLITRA',
  VAMPIRE = 'VAMPIRE'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BET = 'BET',
  WIN = 'WIN'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface KycDetails {
  nationalIdType: string;
  nationalIdNumber: string;
  address: string;
  issuedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  isAdmin: boolean;
  kyc?: KycDetails;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  status: TransactionStatus;
  details?: string;
  method?: string; // e.g., Esewa, Khalti
  senderNumber?: string;
  senderName?: string;
  screenshot?: string; // URL or base64 placeholder
}

export interface GameSession {
  id: string;
  gameType: GameType;
  betAmount: number;
  winAmount: number;
  multiplier: number;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  priority: string;
  status: 'OPEN' | 'CLOSED';
  date: string;
}

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
};

export interface CardProps {
  title: string;
  message: string;
}
