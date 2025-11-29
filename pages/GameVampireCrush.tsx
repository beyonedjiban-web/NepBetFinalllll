
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { GameType } from '../types';
import { MIN_BET } from '../constants';
import { ExclamationCircleIcon, WalletIcon } from '@heroicons/react/24/solid';

const GameVampireCrush: React.FC = () => {
  const { user, placeBet, handleGameWin } = useAppStore();
  const [betAmount, setBetAmount] = useState(100);
  const [items, setItems] = useState<string[]>(Array(9).fill('⚰️'));
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [lastResult, setLastResult] = useState<{type: 'WIN' | 'LOSS', amount: number} | null>(null);
  const [error, setError] = useState('');

  // Added more filler symbols to make winning harder
  // 5x Skull, 5x Web, 5x Urn to dilute the pool
  const SYMBOLS = ['🧛', '🦇', '🩸', '🐺', '💀', '💀', '💀', '⚱️', '⚱️', '⚱️', '🕸️', '🕸️', '🕸️']; 

  const smash = () => {
    setError('');
    setLastResult(null);
    setMessage('');

    if (betAmount < MIN_BET) {
        setError(`Min: ${MIN_BET}`);
        return;
    }
    if (!user || user.balance < betAmount) {
        setError("Insufficient Balance");
        return;
    }

    const success = placeBet(betAmount);
    if (!success) return;

    setPlaying(true);
    setItems(Array(9).fill('💥')); // Explosion effect
    setMessage('SUMMONING...');

    setTimeout(() => {
        // Generate results
        const newItems = Array(9).fill(null).map(() => 
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        );
        setItems(newItems);

        // Count occurences
        const counts: Record<string, number> = {};
        newItems.forEach(x => { counts[x] = (counts[x] || 0) + 1; });

        // Win Logic (Harder: Need 4+ for most)
        let multiplier = 0;
        let winText = '';

        if (counts['🧛'] >= 3) { multiplier = 5.0; winText = 'VAMPIRE JACKPOT!'; }
        else if (counts['🦇'] >= 4) { multiplier = 3.0; winText = 'BAT SWARM!'; }
        else if (counts['🩸'] >= 4) { multiplier = 2.0; winText = 'BLOOD THIRST!'; }
        else if (counts['🐺'] >= 4) { multiplier = 1.5; winText = 'WOLF PACK!'; }
        
        if (multiplier > 0) {
            const win = betAmount * multiplier;
            handleGameWin(win, GameType.VAMPIRE, multiplier);
            setMessage(winText);
            setLastResult({ type: 'WIN', amount: win });
        } else {
            setMessage('THE DARKNESS CONSUMES...');
            setLastResult({ type: 'LOSS', amount: betAmount });
        }
        setPlaying(false);
    }, 1000);
  };

  return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up pb-24 md:pb-20">
           {/* Stats Bar */}
           <div className="bg-slate-900 p-3 md:p-4 rounded-2xl border border-red-900/30 flex justify-between items-center shadow-lg sticky top-20 z-20">
             <div className="flex flex-col">
                 <span className="text-[10px] md:text-xs text-red-400 font-bold uppercase">Balance</span>
                 <div className="flex items-center gap-2">
                     <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                     <span className="text-sm md:text-xl font-bold text-white">{user?.balance.toFixed(2)}</span>
                 </div>
             </div>
             {lastResult && (
                 <div className={`px-3 py-1 md:px-4 md:py-2 rounded-xl border font-bold text-sm md:text-lg animate-bounce-short ${lastResult.type === 'WIN' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                     {lastResult.type === 'WIN' ? `+${lastResult.amount} NPR` : `-${lastResult.amount} NPR`}
                 </div>
             )}
          </div>

          <div className="bg-slate-950 rounded-[2rem] overflow-hidden border-2 border-red-900/50 shadow-[0_0_50px_rgba(153,27,27,0.3)] relative">
              <div className="bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] bg-red-950/30 p-6 md:p-8 text-center relative border-b border-red-900/30 min-h-[120px] md:min-h-[150px] flex flex-col items-center justify-center">
                  <h2 className="text-4xl md:text-5xl font-black text-red-600 font-serif mb-1 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">VAMPIRE</h2>
                  <h3 className="text-lg md:text-xl font-thin text-red-200 tracking-[1em] uppercase">CRUSH</h3>
                  
                  {/* Result Overlay */}
                  {lastResult && !playing && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-pulse">
                          <div className={`text-3xl md:text-4xl font-black mb-1 ${lastResult.type === 'WIN' ? 'text-yellow-400' : 'text-red-500'}`}>
                              {lastResult.type === 'WIN' ? 'YOU WON' : 'YOU LOST'}
                          </div>
                          <div className={`text-4xl md:text-5xl font-black ${lastResult.type === 'WIN' ? 'text-white drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'text-red-300'}`}>
                              {lastResult.type === 'WIN' ? `+${lastResult.amount}` : `-${lastResult.amount}`}
                          </div>
                      </div>
                  )}
              </div>

              <div className="p-4 md:p-12 bg-slate-950">
                  <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10">
                      {items.map((item, i) => (
                          <div key={i} className={`
                            aspect-square bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border border-slate-800
                            ${playing ? 'animate-pulse bg-red-900/20' : ''}
                          `}>
                              <span className={`${playing ? 'scale-150 opacity-50' : 'scale-100'} transition-transform duration-500`}>
                                  {item}
                              </span>
                          </div>
                      ))}
                  </div>

                  {message && (
                      <div className="text-center mb-6 text-red-200 font-serif tracking-widest font-bold text-sm md:text-lg h-8 animate-pulse">
                          {message}
                      </div>
                  )}

                  <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-full">
                           <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] md:text-xs font-bold text-red-500/70 uppercase">Stake</label>
                                {error && <span className="text-[10px] md:text-xs text-red-500 font-bold flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3" /> {error}</span>}
                           </div>
                           <div className="relative">
                                <input 
                                    type="number"
                                    value={betAmount}
                                    onChange={e => { setBetAmount(Number(e.target.value)); setError(''); }}
                                    className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl p-3 md:p-4 text-white font-bold text-lg md:text-xl outline-none focus:border-red-600 transition-colors`}
                                />
                           </div>
                      </div>
                      <button 
                          onClick={smash}
                          disabled={playing}
                          className="w-full md:w-auto px-10 bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-serif font-black text-xl md:text-2xl py-3 md:py-4 rounded-xl shadow-[0_0_20px_rgba(153,27,27,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 h-[70px] md:h-[86px] flex items-center justify-center"
                      >
                          {playing ? (
                            <span className="animate-spin text-3xl md:text-4xl">⚙️</span>
                          ) : 'CRUSH'}
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default GameVampireCrush;
