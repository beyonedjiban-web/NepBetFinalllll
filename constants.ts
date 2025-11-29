
import { GameType } from './types';

export const APP_NAME = "NepBet";
export const CURRENCY = "NPR";

export const MIN_DEPOSIT = 200; 
export const MAX_DEPOSIT = 2000; 
export const MIN_BET = 30;
export const MIN_WITHDRAW = 400; // New Minimum Withdrawal Limit

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'NepBet#2025' // Strong default password
};

// Admin Wallet Configuration
export const ADMIN_WALLETS = {
  esewa: {
    id: 'esewa',
    name: 'eSewa',
    number: '9704748957',
    // Direct Image Link
    qrImage: 'https://i.postimg.cc/gjY5Gdsg/esewa.jpg', 
    logo: 'ES',
    color: 'bg-emerald-600'
  },
  khalti: {
    id: 'khalti',
    name: 'Khalti',
    number: '9704748957',
    // Direct Image Link
    qrImage: 'https://i.postimg.cc/mDSXXJ4M/khalti.png',
    logo: 'KH',
    color: 'bg-purple-600'
  },
  bank: {
    id: 'bank',
    name: 'Bank Transfer',
    number: '00000000000000', 
    bankName: 'Nabil Bank',
    // Direct Image Link (User provided same as Khalti)
    qrImage: 'https://i.postimg.cc/mDSXXJ4M/khalti.png',
    logo: 'BK',
    color: 'bg-red-600'
  }
};

export const GAMES = [
  {
    id: GameType.CRASH,
    name: "NepCrash",
    description: "Eject before the crash! Multipliers up to 100x.",
    image: "https://i.postimg.cc/HxnPV3Xs/Screenshot-2024-12-03-at-10-43-43.jpg", // Crash Screenshot
    color: "from-red-600 to-orange-600",
    hot: true
  },
  {
    id: GameType.MINES,
    name: "Royal Mines",
    description: "Navigate the grid, find diamonds, avoid bombs.",
    image: "https://i.postimg.cc/150tWKnb/e-YOdi-HMnbciag-Az-Fu-FWA3lc-R1j-NZa-I-WXu703cj0Gwrqy-BN8te-Rf-BJyj6UABuhcy-A.webp", // Royal Mines
    color: "from-emerald-600 to-teal-600",
    hot: true
  },
  {
    id: GameType.DICE_7,
    name: "Under Over 7",
    description: "Classic 2-Dice Game. Predict the sum.",
    image: "https://i.postimg.cc/Njfgdvcq/under-and-over-7-7075290.webp", // Under Over 7
    color: "from-blue-600 to-indigo-600",
    hot: false
  },
  {
    id: GameType.CRYSTALS,
    name: "Magic Crystals",
    description: "Match rare crystals for massive wins.",
    image: "https://i.postimg.cc/D0PTcBpv/crystal-magic.jpg", // Magic Crystal
    color: "from-purple-600 to-fuchsia-600",
    hot: true
  },
  {
    id: GameType.SOLITRA,
    name: "Solitra Card",
    description: "Guess Higher or Lower. Climb the ladder.",
    image: "https://i.postimg.cc/4y9GhXVf/WEB-SOL-logo-1.png", // Solitra
    color: "from-amber-600 to-yellow-600",
    hot: false
  },
  {
    id: GameType.VAMPIRE,
    name: "Vampire Crush",
    description: "Smash symbols in this spooky instant game.",
    image: "https://i.postimg.cc/KjN6T4j6/images-(1).jpg", // Vampire
    color: "from-rose-900 to-red-900",
    hot: false
  }
];

export const PAYMENT_METHODS = [
  ADMIN_WALLETS.esewa,
  ADMIN_WALLETS.khalti,
  ADMIN_WALLETS.bank
];
