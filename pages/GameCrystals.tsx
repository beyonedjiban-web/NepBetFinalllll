
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { GameType } from '../types';
import { MIN_BET } from '../constants';
import { ExclamationCircleIcon, WalletIcon } from '@heroicons/react/24/solid';

const SYMBOLS = ['💎', '🔮', '🔶', '🌙', '⭐', '🍀', '💣']; // Added Bomb
const PAYOUTS = {
    '💎': 15, // Increased max payout
    '🔮': 8,
    '🔶': 4,
    '🌙': 2,
    '⭐': 1, // Break even
    '🍀': 0,
    '💣': 0
};

const GameCrystals: React.FC = () => {
  const { user, placeBet, handleGameWin } = useAppStore();
  const [betAmount, setBetAmount] = useState(100);
  const [grid, setGrid] = useState<string[]>(Array(9).fill('❓'));
  const [spinning, setSpinning] = useState(false);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [lastResult, setLastResult] = useState<{type: 'WIN' | 'LOSS', amount: number} | null>(null);
  const [error, setError] = useState('');

  const spin = () => {
      setError('');
      setLastResult(null);
      
      if (betAmount < MIN_BET) {
          setError(`Min Bet: ${MIN_BET} NPR`);
          return;
      }
      if (!user || user.balance < betAmount) {
          setError("Insufficient Balance");
          return;
      }

      const success = placeBet(betAmount);
      if (!success) return;

      setSpinning(true);
      setWinLine(null);

      let frames = 0;
      const interval = setInterval(() => {
          setGrid(prev => prev.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
          frames++;
          if(frames > 15) {
              clearInterval(interval);
              calculateWin();
          }
      }, 80);
  };

  const calculateWin = () => {
      setSpinning(false);
      
      // RIGGED: Extremely weighted towards losing symbols
      const weightedSymbols = [
          ...Array(1).fill('💎'), // Super Rare
          ...Array(2).fill('🔮'),
          ...Array(3).fill('🔶'),
          ...Array(4).fill('🌙'),
          ...Array(6).fill('⭐'),
          ...Array(15).fill('🍀'), // Lose
          ...Array(20).fill('💣')  // Extra Lose (More Bombs)
      ];

      const finalGrid = Array(9).fill(null).map(() => 
          weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)]
      );
      setGrid(finalGrid);

      // Check Middle Row (Indices 3, 4, 5)
      const row = [finalGrid[3], finalGrid[4], finalGrid[5]];
      
      let multiplier = 0;
      let winningIdxs: number[] = [];

      // Logic: STRICTLY 3 MATCH only. No partial wins.
      if (row[0] === row[1] && row[1] === row[2]) {
          const symbol = row[0];
          // @ts-ignore
          multiplier = PAYOUTS[symbol] || 0;
          if (multiplier > 0) {
              winningIdxs = [3, 4, 5];
          }
      }

      if (multiplier > 0) {
          const win = betAmount * multiplier;
          handleGameWin(win, GameType.CRYSTALS, multiplier);
          setLastResult({ type: 'WIN', amount: win });
          setWinLine(winningIdxs);
      } else {
          setLastResult({ type: 'LOSS', amount: betAmount });
      }
  };

  return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-24 md:pb-20">
          {/* Stats Bar */}
          <div className="bg-slate-800 p-3 md:p-4 rounded-2xl border border-slate-700 flex justify-between items-center shadow-lg sticky top-20 z-20">
             <div className="flex flex-col">
                 <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Balance</span>
                 <div className="flex items-center gap-2">
                     <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                     <span className="text-sm md:text-xl font-bold text-white">{user?.balance.toFixed(2)}</span>
                 </div>
             </div>
             {lastResult && (
                 <div className={`px-3 py-1 md:px-4 md:py-2 rounded-xl border font-bold text-sm md:text-lg animate-bounce-short ${lastResult.type === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                     {lastResult.type === 'WIN' ? `+${lastResult.amount} NPR` : `-${lastResult.amount} NPR`}
                 </div>
             )}
          </div>

          <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-4 md:p-10 border border-slate-800 shadow-2xl relative">
              <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-md">
                      Magic Crystals
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm mt-2 font-medium">Match 3 symbols in the center row</p>
              </div>

              <div className="bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-8 border-2 md:border-4 border-slate-700 relative overflow-hidden shadow-inner min-h-[250px] md:min-h-[300px] flex items-center justify-center">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-slate-900"></div>
                 
                 {/* Payline Marker */}
                 <div className="absolute top-1/2 left-0 w-full h-20 md:h-28 -translate-y-1/2 bg-white/5 border-y-2 border-purple-500/30 z-0 pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.2)]"></div>

                 <div className="grid grid-cols-3 gap-3 md:gap-6 relative z-10 w-full">
                     {grid.map((sym, i) => (
                         <div 
                            key={i} 
                            className={`
                                h-16 sm:h-24 md:h-28 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-3xl sm:text-5xl md:text-6xl shadow-md border border-slate-700
                                ${winLine?.includes(i) ? 'bg-purple-900/80 ring-2 md:ring-4 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] z-20 scale-105' : ''}
                                ${i >= 3 && i <= 5 ? 'opacity-100' : 'opacity-30 grayscale blur-[1px]'}
                                transition-all duration-300
                            `}
                         >
                             <span className={spinning ? 'animate-bounce blur-[2px]' : ''}>{sym}</span>
                         </div>
                     ))}
                 </div>

                 {/* Win/Loss Overlay */}
                 {lastResult && !spinning && (
                     <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fade-in-up p-4">
                         <div className="text-center bg-slate-800 border border-slate-600 p-6 md:p-8 rounded-3xl shadow-2xl transform scale-105">
                             <div className="text-5xl md:text-6xl mb-4">{lastResult.type === 'WIN' ? '💎' : '💸'}</div>
                             <div className="text-xl md:text-2xl font-black text-white mb-2">{lastResult.type === 'WIN' ? 'YOU WON' : 'YOU LOST'}</div>
                             <div className={`text-2xl md:text-4xl font-black ${lastResult.type === 'WIN' ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]' : 'text-red-400'}`}>
                                 {lastResult.type === 'WIN' ? `NPR ${lastResult.amount}` : `NPR ${lastResult.amount}`}
                             </div>
                         </div>
                     </div>
                 )}
              </div>

              <div className="mt-6 md:mt-8 flex flex-col md:flex-row gap-4 md:gap-6 items-end bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700/50">
                  <div className="w-full md:flex-1">
                      <div className="flex justify-between mb-1">
                         <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Bet Amount</label>
                         {error && <span className="text-[10px] md:text-xs font-bold text-red-500 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {error}</span>}
                      </div>
                      <input 
                        type="number"
                        value={betAmount}
                        onChange={e => { setBetAmount(Number(e.target.value)); setError(''); }}
                        className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-xl p-3 md:p-4 text-white font-bold text-lg md:text-xl outline-none focus:border-purple-500 transition-colors`}
                      />
                  </div>
                  <button
                    onClick={spin}
                    disabled={spinning}
                    className="w-full md:flex-[2] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xl md:text-2xl py-3 md:py-4 rounded-xl shadow-lg shadow-purple-900/50 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed border-b-4 border-purple-900 h-[60px] md:h-[62px]"
                  >
                      {spinning ? 'SPINNING...' : 'SPIN'}
                  </button>
              </div>
          </div>
      </div>
  );
};

export default GameCrystals;
