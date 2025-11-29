
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { GameType } from '../types';
import { MIN_BET } from '../constants';
import { WalletIcon } from '@heroicons/react/24/solid';

const GameDice: React.FC = () => {
  const { user, placeBet, handleGameWin } = useAppStore();
  const [betAmount, setBetAmount] = useState(100);
  const [choice, setChoice] = useState<'UNDER' | 'EXACT' | 'OVER' | null>(null);
  const [rolling, setRolling] = useState(false);
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [lastResult, setLastResult] = useState<'WIN' | 'LOSE' | null>(null);

  // RIGGED ODDS: Significantly lower than fair odds (High House Edge)
  const ODDS = {
    UNDER: 1.70, // Fair is ~2.3, this is very low
    EXACT: 3.50, // Fair is ~6.0, this is very low
    OVER: 1.70   // Fair is ~2.3, this is very low
  };

  const handleRoll = (selectedChoice: 'UNDER' | 'EXACT' | 'OVER') => {
    if (betAmount < MIN_BET) {
        alert(`Minimum bet is ${MIN_BET}`);
        return;
    }
    if (!user || user.balance < betAmount) {
      alert("Insufficient Balance");
      return;
    }

    // Immediate Deduction
    const success = placeBet(betAmount);
    if (!success) return;

    setChoice(selectedChoice);
    setRolling(true);
    setLastResult(null);

    // Animation frames
    let frames = 0;
    const interval = setInterval(() => {
        setDiceValues([Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1]);
        frames++;
        if (frames > 15) {
            clearInterval(interval);
            finishRoll(selectedChoice);
        }
    }, 80);
  };

  const finishRoll = (selectedChoice: 'UNDER' | 'EXACT' | 'OVER') => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDiceValues([d1, d2]);
    setRolling(false);

    const sum = d1 + d2;
    let won = false;

    if (selectedChoice === 'UNDER' && sum < 7) won = true;
    else if (selectedChoice === 'OVER' && sum > 7) won = true;
    else if (selectedChoice === 'EXACT' && sum === 7) won = true;

    if (won) {
        const payout = betAmount * ODDS[selectedChoice];
        handleGameWin(payout, GameType.DICE_7, ODDS[selectedChoice]);
        setLastResult('WIN');
    } else {
        setLastResult('LOSE');
    }
  };

  const renderDice = (val: number) => {
      return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-3xl shadow-[0_4px_0_#cbd5e1] md:shadow-[0_8px_0_#cbd5e1] border-2 md:border-4 border-slate-200 flex items-center justify-center relative overflow-hidden transform hover:-translate-y-1 transition-transform">
             <span className={`text-4xl sm:text-5xl md:text-6xl font-black ${val === 1 ? 'text-red-500' : 'text-slate-800'}`}>{val}</span>
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in-up pb-24 md:pb-20">
        
        {/* Top Bar with Balance */}
        <div className="bg-slate-800 p-3 md:p-4 rounded-2xl border border-slate-700 flex justify-between items-center shadow-lg sticky top-20 z-20">
             <div className="flex flex-col">
                 <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Balance</span>
                 <div className="flex items-center gap-2">
                     <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                     <span className="text-sm md:text-xl font-bold text-white">{user?.balance.toFixed(2)}</span>
                 </div>
             </div>
             {lastResult === 'WIN' && <div className="text-emerald-400 font-bold text-sm md:text-lg animate-bounce">+{(betAmount * (choice ? ODDS[choice] : 0)).toFixed(0)} NPR</div>}
             {lastResult === 'LOSE' && <div className="text-red-400 font-bold text-sm md:text-lg animate-bounce">-{betAmount} NPR</div>}
        </div>

        <div className="bg-slate-800 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <div className="text-center pb-4 md:pb-6 border-b border-slate-700">
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-wide uppercase italic">
                    <span className="text-blue-500">Under</span> / <span className="text-purple-500">Over</span> 7
                </h2>
                <p className="text-xs md:text-base text-slate-400 mt-2 font-medium">Predict the sum of two dice</p>
            </div>

            {/* Dice Area */}
            <div className="bg-slate-900 rounded-3xl p-6 md:p-12 flex flex-col items-center justify-center gap-6 md:gap-8 border border-slate-700 shadow-inner relative overflow-hidden min-h-[250px] md:min-h-[350px]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className={`flex gap-4 md:gap-8 transition-all duration-200 relative z-10 ${rolling ? 'scale-110 blur-[1px]' : ''}`}>
                    {renderDice(diceValues[0])}
                    {renderDice(diceValues[1])}
                </div>
                
                <div className="text-center relative z-10">
                    <div className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Sum</div>
                    <div className={`text-4xl md:text-5xl font-black ${rolling ? 'text-slate-400' : 'text-emerald-400'} transition-colors`}>
                        {diceValues[0] + diceValues[1]}
                    </div>
                </div>
                
                {lastResult && !rolling && (
                    <div className={`absolute top-6 px-4 md:px-6 py-1 md:py-2 rounded-full font-bold text-sm md:text-lg animate-bounce-short shadow-xl ${lastResult === 'WIN' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {lastResult === 'WIN' ? `WIN! +${(betAmount * (choice ? ODDS[choice] : 0)).toFixed(0)}` : `LOST -${betAmount}`}
                    </div>
                )}
            </div>

            {/* Bet Amount */}
            <div className="bg-slate-700/30 p-4 md:p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between text-[10px] md:text-xs text-slate-400 mb-3 font-bold uppercase">
                    <span>Bet Amount (Min: {MIN_BET})</span>
                </div>
                <div className="flex gap-4">
                    <input 
                        type="number" 
                        value={betAmount} 
                        onChange={e => setBetAmount(Number(e.target.value))}
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-xl p-3 md:p-4 text-white font-bold text-center text-xl md:text-2xl focus:border-blue-500 outline-none shadow-inner"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <button 
                    onClick={() => handleRoll('UNDER')}
                    disabled={rolling}
                    className="group relative bg-gradient-to-b from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 border border-blue-700/50 rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20 active:scale-[0.98]"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                    <div className="text-[10px] md:text-xs text-blue-400 font-black mb-2 tracking-wider">PAYOUT {ODDS.UNDER.toFixed(2)}x</div>
                    <div className="text-2xl md:text-3xl font-black text-white mb-1">UNDER 7</div>
                    <div className="text-xs md:text-sm text-blue-300/60 font-medium">Sum 2-6</div>
                </button>

                <button 
                    onClick={() => handleRoll('EXACT')}
                    disabled={rolling}
                    className="group relative bg-gradient-to-b from-emerald-900 to-emerald-950 hover:from-emerald-800 hover:to-emerald-900 border border-emerald-700/50 rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20 active:scale-[0.98]"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                    <div className="text-[10px] md:text-xs text-emerald-400 font-black mb-2 tracking-wider">PAYOUT {ODDS.EXACT.toFixed(2)}x</div>
                    <div className="text-2xl md:text-3xl font-black text-white mb-1">EXACT 7</div>
                    <div className="text-xs md:text-sm text-emerald-300/60 font-medium">Sum 7</div>
                </button>

                <button 
                    onClick={() => handleRoll('OVER')}
                    disabled={rolling}
                    className="group relative bg-gradient-to-b from-purple-900 to-purple-950 hover:from-purple-800 hover:to-purple-900 border border-purple-700/50 rounded-2xl p-4 md:p-6 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-900/20 active:scale-[0.98]"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                    <div className="text-[10px] md:text-xs text-purple-400 font-black mb-2 tracking-wider">PAYOUT {ODDS.OVER.toFixed(2)}x</div>
                    <div className="text-2xl md:text-3xl font-black text-white mb-1">OVER 7</div>
                    <div className="text-xs md:text-sm text-purple-300/60 font-medium">Sum 8-12</div>
                </button>
            </div>
        </div>
    </div>
  );
};

export default GameDice;
