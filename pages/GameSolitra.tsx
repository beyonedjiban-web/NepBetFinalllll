
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { GameType } from '../types';
import { MIN_BET } from '../constants';
import { WalletIcon } from '@heroicons/react/24/solid';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const VALUES: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const GameSolitra: React.FC = () => {
  const { user, placeBet, handleGameWin } = useAppStore();
  const [betAmount, setBetAmount] = useState(100);
  const [currentCard, setCurrentCard] = useState<{rank: string, suit: string} | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [loading, setLoading] = useState(false);

  const getRandomCard = () => {
      return {
          rank: RANKS[Math.floor(Math.random() * RANKS.length)],
          suit: SUITS[Math.floor(Math.random() * SUITS.length)]
      };
  };

  const startGame = () => {
      if (betAmount < MIN_BET) {
          alert(`Minimum bet is ${MIN_BET}`);
          return;
      }
      if (!user || user.balance < betAmount) {
          alert("Insufficient Balance");
          return;
      }
      
      const success = placeBet(betAmount);
      if (!success) return;
      
      setGameState('PLAYING');
      setCurrentCard(getRandomCard());
      setStreak(0);
      setMultiplier(1.0); 
  };

  const handleGuess = (guess: 'HIGHER' | 'LOWER') => {
      if (!currentCard) return;
      setLoading(true);

      setTimeout(() => {
          const nextCard = getRandomCard();
          const currVal = VALUES[currentCard.rank];
          const nextVal = VALUES[nextCard.rank];

          let won = false;
          if (guess === 'HIGHER' && nextVal >= currVal) won = true;
          if (guess === 'LOWER' && nextVal <= currVal) won = true;

          setCurrentCard(nextCard);
          setLoading(false);

          if (won) {
              const newStreak = streak + 1;
              // RIGGED: Reduced growth to 5% per correct guess
              const growth = 1.0 + (newStreak * 0.05); 
              setStreak(newStreak);
              setMultiplier(growth);
          } else {
              setGameState('GAME_OVER');
              setStreak(0);
          }
      }, 500);
  };

  const cashOut = () => {
      const win = betAmount * multiplier;
      handleGameWin(win, GameType.SOLITRA, multiplier);
      setGameState('IDLE');
      setCurrentCard(null);
  };

  const tryAgain = () => {
      setGameState('IDLE');
      setCurrentCard(null);
  }

  return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-24 md:pb-20">
           {/* Top Bar with Balance */}
           <div className="bg-slate-800 p-3 md:p-4 rounded-2xl border border-slate-700 flex justify-between items-center shadow-lg sticky top-20 z-20">
                 <div className="flex flex-col">
                     <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Balance</span>
                     <div className="flex items-center gap-2">
                         <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                         <span className="text-sm md:text-xl font-bold text-white">{user?.balance.toFixed(2)}</span>
                     </div>
                 </div>
                 {gameState === 'GAME_OVER' && <div className="text-red-400 font-bold text-sm md:text-lg animate-bounce">Lost -{betAmount} NPR</div>}
            </div>

           <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 pb-4 md:pb-6 border-b border-slate-800 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-amber-500 font-serif">Solitra</h2>
                        <p className="text-xs md:text-sm text-slate-400">Climb the ladder. Ace is High.</p>
                    </div>
                    {gameState === 'PLAYING' && (
                        <div className="w-full md:w-auto text-center md:text-right bg-slate-800 px-4 py-2 md:px-6 md:py-3 rounded-2xl border border-slate-700">
                            <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Pot Value</div>
                            <div className="text-lg md:text-2xl font-black text-emerald-400">NPR {(betAmount * multiplier).toFixed(0)}</div>
                            <div className="text-[10px] md:text-xs text-amber-500 font-bold">{multiplier.toFixed(2)}x Multiplier</div>
                        </div>
                    )}
                </div>

                <div className="min-h-[300px] md:min-h-[350px] flex flex-col items-center justify-center mb-6 md:mb-8 relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-emerald-900/10 rounded-3xl border border-emerald-500/10 backdrop-blur-sm z-0"></div>

                    <div className="relative z-10">
                        {currentCard ? (
                            <div className={`
                                w-32 h-48 sm:w-40 sm:h-64 md:w-48 md:h-72 bg-white rounded-xl md:rounded-2xl shadow-2xl flex flex-col items-center justify-center select-none transition-all duration-300 transform
                                ${['♥', '♦'].includes(currentCard.suit) ? 'text-red-600' : 'text-slate-900'}
                                ${loading ? 'rotate-y-90 scale-90' : 'rotate-y-0 scale-100'}
                                ${gameState === 'GAME_OVER' ? 'grayscale opacity-50' : ''}
                            `}>
                                <div className="absolute top-2 left-2 md:top-4 md:left-4 text-xl md:text-3xl font-bold">{currentCard.rank}</div>
                                <div className="text-6xl sm:text-7xl md:text-8xl">{currentCard.suit}</div>
                                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 text-xl md:text-3xl font-bold rotate-180">{currentCard.rank}</div>
                            </div>
                        ) : (
                            <div className="w-32 h-48 sm:w-40 sm:h-64 md:w-48 md:h-72 border-4 border-dashed border-slate-700 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-2 bg-slate-800/50">
                                <div className="text-3xl md:text-4xl">🃏</div>
                                <span className="font-bold uppercase tracking-wider text-xs md:text-base">Empty</span>
                            </div>
                        )}
                    </div>
                    
                    {gameState === 'GAME_OVER' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-3xl">
                            <div className="text-center animate-bounce-short">
                                <h3 className="text-3xl md:text-4xl font-black text-red-500 mb-2 drop-shadow-lg">BUSTED</h3>
                                <button onClick={tryAgain} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-full text-white font-bold border border-slate-600">Try Again</button>
                            </div>
                        </div>
                    )}
                    
                    {gameState === 'PLAYING' && !loading && (
                        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 md:px-12 z-0 pointer-events-none opacity-20">
                            <span className="text-6xl md:text-9xl font-black text-white">HI</span>
                            <span className="text-6xl md:text-9xl font-black text-white">LO</span>
                        </div>
                    )}
                </div>

                {gameState === 'IDLE' || gameState === 'GAME_OVER' ? (
                    <div className="bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-700">
                            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Bet Amount</label>
                            <div className="flex gap-4 mt-2">
                                <input 
                                    type="number"
                                    value={betAmount}
                                    onChange={e => setBetAmount(Number(e.target.value))}
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded-xl p-3 md:p-4 text-white font-bold text-lg md:text-xl outline-none focus:border-amber-500 transition-colors"
                                />
                                <button 
                                    onClick={startGame}
                                    className="flex-[2] bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black text-lg md:text-xl rounded-xl shadow-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all"
                                >
                                    DEAL CARDS
                                </button>
                            </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleGuess('HIGHER')}
                            disabled={loading}
                            className="bg-slate-700 hover:bg-slate-600 text-white p-4 md:p-6 rounded-2xl font-black text-lg md:text-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 group active:bg-slate-600"
                        >
                            HIGHER <span className="group-hover:-translate-y-1 transition-transform">↑</span>
                        </button>
                        <button 
                            onClick={() => handleGuess('LOWER')}
                            disabled={loading}
                            className="bg-slate-700 hover:bg-slate-600 text-white p-4 md:p-6 rounded-2xl font-black text-lg md:text-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 group active:bg-slate-600"
                        >
                            LOWER <span className="group-hover:translate-y-1 transition-transform">↓</span>
                        </button>
                        
                        <button 
                            onClick={cashOut}
                            disabled={loading || streak === 0}
                            className="col-span-2 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white p-4 md:p-5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/50 border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 transition-all active:bg-emerald-700"
                        >
                            CASH OUT (NPR {(betAmount * multiplier).toFixed(0)})
                        </button>
                    </div>
                )}
           </div>
      </div>
  );
};

export default GameSolitra;
