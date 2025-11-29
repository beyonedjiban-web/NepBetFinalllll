
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { GameType } from '../types';
import { MIN_BET } from '../constants';
import { SparklesIcon, FireIcon, WalletIcon } from '@heroicons/react/24/solid';

const GRID_SIZE = 25; // 5x5

const GameMines: React.FC = () => {
  const { user, placeBet, handleGameWin } = useAppStore();
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [grid, setGrid] = useState<boolean[]>(Array(GRID_SIZE).fill(false)); 
  const [revealed, setRevealed] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
  const [multiplier, setMultiplier] = useState(1.0);
  const [gemsFound, setGemsFound] = useState(0);

  const calculateNextMultiplier = (currentGems: number, totalMines: number) => {
    let m = 1.0;
    for(let i=0; i<currentGems; i++) {
        const remainingTiles = 25 - i;
        const remainingSafe = 25 - totalMines - i;
        const prob = remainingSafe / remainingTiles;
        m = m * (1/prob);
    }
    // RIGGED: Heavily reduce multiplier to 60% of fair value (40% House Edge)
    return m * 0.60; 
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

    const newGrid = Array(GRID_SIZE).fill(false);
    let minesPlaced = 0;
    while(minesPlaced < mineCount) {
        const idx = Math.floor(Math.random() * GRID_SIZE);
        if(!newGrid[idx]) {
            newGrid[idx] = true;
            minesPlaced++;
        }
    }

    setGrid(newGrid);
    setRevealed(Array(GRID_SIZE).fill(false));
    setGameState('PLAYING');
    setGemsFound(0);
    setMultiplier(1.0);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'PLAYING' || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (grid[index]) {
      setGameState('LOST');
      setRevealed(Array(GRID_SIZE).fill(true));
    } else {
      const newGemsFound = gemsFound + 1;
      setGemsFound(newGemsFound);
      
      const newMult = calculateNextMultiplier(newGemsFound, mineCount);
      setMultiplier(newMult);

      if (newGemsFound === (GRID_SIZE - mineCount)) {
          cashOut(newMult);
      }
    }
  };

  const cashOut = (finalMult = multiplier) => {
    setGameState('WON');
    setRevealed(Array(GRID_SIZE).fill(true));
    const winAmount = betAmount * finalMult;
    handleGameWin(winAmount, GameType.MINES, finalMult);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 animate-fade-in-up pb-24 md:pb-20">
      {/* Stats Bar */}
      <div className="bg-slate-800 p-3 md:p-4 rounded-2xl border border-slate-700 flex justify-between items-center shadow-lg sticky top-20 z-20">
          <div className="flex flex-col">
              <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">Balance</span>
              <div className="flex items-center gap-2">
                  <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                  <span className="text-sm md:text-xl font-bold text-white">{user?.balance.toFixed(2)}</span>
              </div>
          </div>
          {gameState === 'LOST' && (
              <div className="px-3 py-1 md:px-4 md:py-2 rounded-xl border border-red-500/50 bg-red-500/20 text-red-400 font-bold text-xs md:text-lg animate-bounce-short">
                  Lost -{betAmount}
              </div>
          )}
          {gameState === 'WON' && (
              <div className="px-3 py-1 md:px-4 md:py-2 rounded-xl border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 font-bold text-xs md:text-lg animate-bounce-short">
                  Won +{(betAmount * multiplier).toFixed(2)}
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Grid Area */}
      <div className="order-2 lg:order-1 bg-slate-800 rounded-3xl p-4 md:p-8 border border-slate-700 shadow-2xl relative flex items-center justify-center">
         <div className="grid grid-cols-5 gap-2 md:gap-4 w-full max-w-[300px] sm:max-w-[380px] md:max-w-[450px] aspect-square">
            {Array.from({ length: GRID_SIZE }).map((_, idx) => {
                const isRevealed = revealed[idx];
                const isMine = grid[idx];
                
                return (
                    <button
                        key={idx}
                        onClick={() => handleTileClick(idx)}
                        disabled={gameState !== 'PLAYING' && !isRevealed}
                        className={`
                            rounded-lg md:rounded-xl transition-all duration-300 relative overflow-hidden shadow-md touch-manipulation
                            ${isRevealed 
                                ? isMine 
                                    ? 'bg-red-900/80 border border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.5)]' 
                                    : 'bg-emerald-900/50 border border-emerald-500/50'
                                : 'bg-slate-700 hover:bg-slate-600 border-b-2 md:border-b-4 border-slate-900 active:border-b-0 active:translate-y-0 shadow-lg'
                            }
                            ${gameState === 'PLAYING' && !isRevealed ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}
                        `}
                    >
                        {isRevealed && (
                            <div className="absolute inset-0 flex items-center justify-center animate-bounce-short">
                                {isMine ? (
                                    <FireIcon className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                ) : (
                                    <SparklesIcon className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                )}
                            </div>
                        )}
                    </button>
                );
            })}
         </div>
      </div>

      {/* Controls Area */}
      <div className="order-1 lg:order-2 space-y-4 md:space-y-6">
        <div className="bg-slate-800 rounded-3xl p-4 md:p-8 border border-slate-700 shadow-xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-700">
                <div className="bg-emerald-500 p-2 rounded-lg">
                    <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-white">Royal Mines</h2>
            </div>
            
            <div className="space-y-4 md:space-y-6 flex-1">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Bet Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">NPR</span>
                        <input 
                            type="number" 
                            value={betAmount} 
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            disabled={gameState === 'PLAYING'}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 md:py-4 pl-14 pr-4 text-white font-bold text-lg md:text-xl focus:border-emerald-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <label className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-3">
                        <span>Mines Count</span>
                        <span className="text-emerald-500">{mineCount} Mines</span>
                    </label>
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={mineCount} 
                        onChange={(e) => setMineCount(Number(e.target.value))}
                        disabled={gameState === 'PLAYING'}
                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="grid grid-cols-5 gap-2 mt-4">
                        {[1, 3, 5, 10, 20].map(cnt => (
                            <button 
                                key={cnt}
                                onClick={() => setMineCount(cnt)}
                                disabled={gameState === 'PLAYING'}
                                className={`py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all ${mineCount === cnt ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                            >
                                {cnt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 md:mt-8">
                {gameState === 'PLAYING' ? (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-emerald-900/50 to-slate-900 border border-emerald-500/30 p-4 md:p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Current Win</div>
                                <div className="text-xl md:text-3xl font-black text-emerald-400 text-shadow-glow">
                                    {(betAmount * multiplier).toFixed(2)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Multiplier</div>
                                <div className="text-lg md:text-2xl font-bold text-white">{multiplier.toFixed(2)}x</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => cashOut()}
                            disabled={gemsFound === 0}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl shadow-lg shadow-orange-900/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                        >
                            CASH OUT
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={startGame}
                        className={`w-full py-4 md:py-5 rounded-2xl font-black text-lg md:text-2xl shadow-lg transition-all transform active:translate-y-1 border-b-4 touch-manipulation ${
                            gameState === 'LOST' 
                            ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-900' 
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white border-emerald-900 shadow-emerald-900/50'
                        }`}
                    >
                        {gameState === 'WON' ? 'PLAY AGAIN' : gameState === 'LOST' ? 'TRY AGAIN' : 'START GAME'}
                    </button>
                )}
            </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default GameMines;
