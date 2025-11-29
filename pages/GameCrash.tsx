
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../services/store';
import { GameType } from '../types';
import { MIN_BET } from '../constants';
import { ChartBarIcon, RocketLaunchIcon, ExclamationCircleIcon, WalletIcon } from '@heroicons/react/24/solid';

const GameCrash: React.FC = () => {
  const { user, placeBet, handleGameWin } = useAppStore();
  
  const [betAmount, setBetAmount] = useState(50);
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [crashPoint, setCrashPoint] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [lastProfit, setLastProfit] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const GROWTH_SPEED = 0.00006; 

  const animate = useCallback((time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    const currentMult = Math.exp(GROWTH_SPEED * elapsed);
    
    setMultiplier(currentMult);
    drawGraph(currentMult, elapsed);

    if (currentMult >= crashPoint) {
      handleCrash(currentMult);
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [crashPoint]);

  const drawGraph = (currentMult: number, elapsed: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const timeScale = Math.max(10000, elapsed * 1.2); 
    const multScale = Math.max(2, currentMult * 1.1); 

    const mapX = (t: number) => (t / timeScale) * (width * 0.9); 
    const mapY = (m: number) => height - ((m - 1) / (multScale - 1)) * (height * 0.8) - 40; 

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let t=0; t<=timeScale; t+=2000) {
        const x = mapX(t);
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for(let m=1; m<=multScale; m+=0.5) {
        const y = mapY(m);
        ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Curve
    ctx.strokeStyle = '#34d399'; 
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, height - 40); 

    const step = 100; 
    for(let t=0; t<=elapsed; t+=step) {
        const m = Math.exp(GROWTH_SPEED * t);
        ctx.lineTo(mapX(t), mapY(m));
    }
    const endX = mapX(elapsed);
    const endY = mapY(currentMult);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
    ctx.fillStyle = gradient;
    ctx.lineTo(endX, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Rocket
    if (gameStatus !== 'CRASHED') {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 15;
        ctx.save();
        ctx.translate(endX, endY);
        const prevTime = Math.max(0, elapsed - 100);
        const prevMult = Math.exp(GROWTH_SPEED * prevTime);
        const prevX = mapX(prevTime);
        const prevY = mapY(prevMult);
        const angle = Math.atan2(endY - prevY, endX - prevX);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-6, 6);
        ctx.lineTo(-6, -6);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
    }
  };

  const startGame = () => {
    setError('');
    setLastProfit(null);
    if (betAmount < MIN_BET) {
        setError(`Minimum bet is ${MIN_BET} NPR`);
        return;
    }
    if (!user || user.balance < betAmount) {
      setError("Insufficient balance");
      return;
    }

    const success = placeBet(betAmount);
    if (!success) return;

    setGameStatus('RUNNING');
    setHasCashedOut(false);
    setMultiplier(1.00);
    startTimeRef.current = 0;

    const r = Math.random();
    let cp = 1.0;
    
    // RIGGED LOGIC: EXTREMELY HIGH CRASH RATE
    if (r < 0.50) {
        // 50% chance to crash almost immediately (1.00x - 1.30x)
        cp = 1.00 + Math.random() * 0.30;
    } 
    else if (r < 0.80) {
        // 30% chance to crash low (1.30x - 1.90x)
        cp = 1.30 + Math.random() * 0.60;
    }
    else if (r < 0.95) {
        // 15% chance to go medium (1.90x - 3.0x)
        cp = 1.90 + Math.random() * 1.1;
    }
    else {
        // 5% chance to go higher
        cp = 3.0 + (Math.random() * 5);
    }
    
    setCrashPoint(cp);
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleCrash = (finalMult: number) => {
    cancelAnimationFrame(requestRef.current!);
    setGameStatus('CRASHED');
    setMultiplier(finalMult);
    setHistory(prev => [finalMult, ...prev].slice(0, 10));
    if (!hasCashedOut) {
        setLastProfit(-betAmount);
    }
  };

  const cashOut = () => {
    if (gameStatus !== 'RUNNING' || hasCashedOut) return;
    setHasCashedOut(true);
    const winAmount = betAmount * multiplier;
    const profit = winAmount - betAmount;
    handleGameWin(winAmount, GameType.CRASH, multiplier);
    setLastProfit(profit);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if(canvas) {
        const resize = () => {
            const parent = canvas.parentElement;
            if(parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                if(gameStatus !== 'RUNNING' && multiplier > 1) {
                    // re-draw static if needed
                }
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameStatus, multiplier]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fade-in-up pb-24 md:pb-16">
      {/* HUD Bar */}
      <div className="bg-slate-800 p-3 md:p-4 rounded-2xl border border-slate-700 flex justify-between items-center shadow-lg sticky top-20 z-20">
          <div className="flex items-center gap-3">
             <div className="bg-slate-700 p-2 rounded-xl hidden sm:block">
                 <RocketLaunchIcon className="w-6 h-6 text-emerald-500" />
             </div>
             <div>
                 <h1 className="text-sm md:text-xl font-black text-white italic">NEPCRASH</h1>
                 <p className="text-[10px] md:text-xs text-slate-400">Current Balance</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 md:px-4 rounded-xl border border-slate-700">
             <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
             <span className="text-sm md:text-lg font-bold text-white tracking-widest">{user?.balance.toFixed(2)} <span className="text-[10px] text-slate-500">NPR</span></span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Game Display */}
      <div className="lg:col-span-3 space-y-4">
        {/* History Bar */}
        <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 flex items-center gap-2 md:gap-4 overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase shrink-0">
                <ChartBarIcon className="w-4 h-4" /> Recent
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full mask-image-r py-1 no-scrollbar">
                {history.map((h, i) => (
                    <div key={i} className={`px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold min-w-[50px] md:min-w-[70px] text-center shadow-md transition-all animate-scale-in
                        ${h < 1.2 ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' 
                        : h < 2 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {h.toFixed(2)}x
                    </div>
                ))}
            </div>
        </div>

        <div className="relative bg-[#0f172a] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden h-[300px] sm:h-[400px] md:h-[550px] flex flex-col items-center justify-center group touch-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
          
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
          
          <div className="relative z-10 text-center pointer-events-none p-4">
            {gameStatus === 'IDLE' && (
              <div className="text-slate-400 text-lg flex flex-col items-center animate-pulse">
                <div className="bg-slate-800/80 backdrop-blur-sm p-4 md:p-6 rounded-full border border-slate-600 shadow-2xl mb-4">
                     <RocketLaunchIcon className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" />
                </div>
                <div className="font-mono uppercase tracking-widest text-emerald-500 font-bold text-sm md:text-base">Ready to Fly</div>
              </div>
            )}
            {gameStatus === 'RUNNING' && (
               <div className="flex flex-col items-center">
                   <div className="text-5xl sm:text-7xl md:text-9xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] tabular-nums">
                     {multiplier.toFixed(2)}<span className="text-2xl sm:text-4xl md:text-6xl text-emerald-500">x</span>
                   </div>
               </div>
            )}
            {gameStatus === 'CRASHED' && (
               <div className="flex flex-col items-center animate-bounce-short">
                 <div className="text-4xl sm:text-7xl md:text-8xl font-black text-rose-500 tracking-tighter mb-2 text-shadow-glow">BUSTED</div>
                 <div className="bg-rose-950/80 px-4 md:px-6 py-2 rounded-full border border-rose-500/50 text-rose-200 font-mono text-sm md:text-xl">
                    Crashed at {multiplier.toFixed(2)}x
                 </div>
                 {!hasCashedOut && (
                     <div className="mt-4 text-red-400 font-bold text-xs md:text-lg bg-black/40 px-4 py-1 rounded">
                         You Lost NPR {betAmount}
                     </div>
                 )}
               </div>
            )}
          </div>
          
          {hasCashedOut && (
             <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-emerald-500/90 backdrop-blur text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl font-bold shadow-2xl shadow-emerald-500/50 flex flex-col items-center animate-fade-in-up border border-emerald-400 w-max z-30">
               <span className="text-[10px] md:text-xs uppercase tracking-widest text-emerald-100">Cashed Out</span>
               <span className="text-xl md:text-2xl font-mono">NPR {(betAmount * multiplier).toFixed(2)}</span>
               <span className="text-xs md:text-sm font-bold bg-emerald-700 px-2 rounded mt-1">+ {lastProfit?.toFixed(2)} Profit</span>
             </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800 rounded-3xl p-4 md:p-6 border border-slate-700 flex flex-col gap-4 md:gap-6 shadow-2xl h-fit lg:h-full relative">
         <div className="flex items-center gap-3 mb-1 pb-4 border-b border-slate-700">
             <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                 <RocketLaunchIcon className="w-5 h-5 text-emerald-500" />
             </div>
             <div>
                 <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wide">Bet Control</h2>
             </div>
         </div>
         
         {/* Bet Input */}
         <div className="bg-slate-900 p-1 rounded-2xl border border-slate-700 shadow-inner">
           <div className="bg-slate-800/50 rounded-xl p-3 md:p-4">
               <div className="flex justify-between items-center mb-2">
                   <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Amount</label>
                   <span className="text-[10px] md:text-xs font-bold text-slate-500">Min: {MIN_BET}</span>
               </div>
               <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 font-bold pl-1 text-lg md:text-base">NPR</span>
                  <input 
                    type="number" 
                    value={betAmount} 
                    onChange={(e) => {
                        setBetAmount(Number(e.target.value));
                        setError('');
                    }}
                    disabled={gameStatus === 'RUNNING'}
                    className="w-full bg-transparent border-none p-0 pl-10 text-white font-bold text-xl md:text-2xl focus:ring-0 outline-none"
                  />
               </div>
               {error && (
                   <div className="mt-2 text-[10px] md:text-xs text-rose-500 flex items-center gap-1 font-bold animate-pulse">
                       <ExclamationCircleIcon className="w-3 h-3" /> {error}
                   </div>
               )}
           </div>
           
           <div className="grid grid-cols-4 gap-1 p-1 mt-1">
             {[100, 200, 500, 1000].map(amt => (
               <button 
                 key={amt} 
                 onClick={() => { setBetAmount(amt); setError(''); }}
                 disabled={gameStatus === 'RUNNING'}
                 className="bg-slate-800 hover:bg-slate-700 text-[10px] md:text-xs py-2 md:py-3 rounded-lg text-slate-300 font-bold transition-colors border border-slate-700 active:bg-slate-600 touch-manipulation"
               >
                 +{amt}
               </button>
             ))}
             <button onClick={() => setBetAmount(betAmount * 2)} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-[10px] md:text-xs py-2 md:py-3 rounded-lg text-slate-300 font-bold border border-slate-700 active:bg-slate-600 touch-manipulation">2X</button>
             <button onClick={() => setBetAmount(Math.floor(user?.balance || 0))} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-[10px] md:text-xs py-2 md:py-3 rounded-lg text-slate-300 font-bold border border-slate-700 active:bg-slate-600 touch-manipulation">MAX</button>
           </div>
         </div>

         {/* Big Action Button */}
         <div className="mt-auto z-10">
           {gameStatus === 'RUNNING' && !hasCashedOut ? (
             <button 
               onClick={cashOut}
               className="w-full bg-orange-500 hover:bg-orange-400 text-white py-4 md:py-6 rounded-xl font-black text-2xl md:text-3xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-orange-400/50 flex flex-col items-center justify-center gap-1 relative overflow-hidden touch-manipulation"
             >
               <span className="relative z-10">CASH OUT</span>
               <span className="relative z-10 text-sm md:text-lg font-medium opacity-90 font-mono bg-black/20 px-4 rounded">
                   +{Math.floor(betAmount * multiplier)}
               </span>
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
             </button>
           ) : (
             <button 
               onClick={startGame}
               disabled={gameStatus === 'RUNNING'}
               className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-4 md:py-6 rounded-xl font-black text-xl md:text-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:translate-y-1 border-b-4 border-emerald-800 disabled:border-slate-800 relative overflow-hidden group touch-manipulation"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {gameStatus === 'CRASHED' ? 'TRY AGAIN' : 'BET'}
             </button>
           )}
         </div>
      </div>
      </div>
    </div>
  );
};

export default GameCrash;
