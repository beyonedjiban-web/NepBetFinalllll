
import React, { useEffect, useState } from 'react';
import { Link } from '../services/store';
import { GAMES } from '../constants';
import { FireIcon, TrophyIcon, CurrencyDollarIcon, StarIcon } from '@heroicons/react/24/solid';

const Home: React.FC = () => {
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    const names = ['Aarav', 'Bibek', 'Sita', 'Ramesh', 'Priya', 'Kiran', 'Suman', 'Gita', 'Rohit', 'Anjali', 'Dipesh', 'Manish'];
    const games = ['Crash', 'Mines', 'Dice', 'Crystals', 'Solitra', 'Vampire'];
    
    // Initial population
    const generateWinner = () => ({
      id: Math.random().toString(),
      user: `${names[Math.floor(Math.random() * names.length)]}***`,
      amount: Math.floor(Math.random() * 45000) + 5000,
      game: games[Math.floor(Math.random() * games.length)],
      time: 'Just now'
    });

    setWinners(Array(6).fill(null).map(generateWinner));

    const interval = setInterval(() => {
      setWinners(prev => {
        const newItem = generateWinner();
        return [newItem, ...prev.slice(0, 9)]; // Keep last 10
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in-up">
      {/* Banner */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[250px] md:min-h-[450px] flex items-center shadow-xl border border-white/5 group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/40"></div>
        
        <div className="relative z-10 px-4 md:px-16 max-w-3xl space-y-3 md:space-y-6">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold border border-emerald-500/30 backdrop-blur-sm animate-fade-in-up">
            <StarIcon className="w-3 h-3 md:w-4 md:h-4" />
            <span>NEPAL'S #1 CASINO</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-tight animate-fade-in-up delay-100 drop-shadow-lg">
            PLAY SMART. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">WIN HUGE.</span>
          </h1>
          
          <p className="text-slate-300 text-xs md:text-xl font-medium max-w-xl animate-fade-in-up delay-200 leading-relaxed hidden sm:block">
            Join thousands of winners on NepBet. Instant withdrawals, verified fairness, and the highest multipliers in the game.
          </p>
          
          <div className="flex gap-3 animate-fade-in-up delay-300 pt-1 md:pt-2">
             <Link to="/wallet" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg transition-all transform hover:translate-y-[-2px] shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2">
               <CurrencyDollarIcon className="w-4 h-4 md:w-6 md:h-6" /> Deposit
             </Link>
             <Link to="/auth" className="bg-slate-700/50 hover:bg-slate-700 text-white px-5 py-2.5 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg backdrop-blur-md border border-white/10 transition-all text-center">
               Register
             </Link>
          </div>
        </div>
      </div>

      {/* Games Grid - Full Width */}
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
              <FireIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              Featured Games
            </h2>
          </div>
          
          {/* Mobile Optimized Grid: 2 Columns on Mobile, 3 on Tablet, 4 on Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6">
            {GAMES.map((game) => (
              <Link 
                key={game.id} 
                to={`/game/${game.id.toLowerCase()}`}
                className="group relative bg-slate-800 rounded-xl md:rounded-2xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1 block"
              >
                <div className="aspect-[1/1] w-full overflow-hidden relative">
                   <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                   <div className={`absolute inset-0 bg-gradient-to-t ${game.color} opacity-20 mix-blend-overlay`}></div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                </div>
                
                {game.hot && (
                  <div className="absolute top-2 right-2 bg-orange-500/90 backdrop-blur text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20 z-10">
                    <FireIcon className="w-3 h-3 animate-pulse" /> HOT
                  </div>
                )}

                <div className="absolute bottom-0 left-0 w-full p-3 md:p-4">
                  <h3 className="font-bold text-xs md:text-sm text-white mb-0 md:mb-1 group-hover:text-emerald-400 transition-colors drop-shadow-md truncate">{game.name}</h3>
                </div>
              </Link>
            ))}
          </div>
      </div>

      {/* Live Winners Section - Below Games */}
      <div className="bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
         <div className="p-4 md:p-6 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              Live Winners
            </h3>
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Live Feed
            </div>
         </div>
         
         <div className="relative">
             {/* Desktop Table View */}
             <div className="hidden md:block">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-900/50 text-slate-400 font-bold text-xs uppercase">
                         <tr>
                             <th className="p-4">User</th>
                             <th className="p-4">Game</th>
                             <th className="p-4 text-right">Amount (NPR)</th>
                             <th className="p-4 text-right">Time</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700">
                         {winners.map((win, idx) => (
                             <tr key={`${win.id}-${idx}`} className="hover:bg-slate-700/30 transition-colors animate-fade-in-right">
                                 <td className="p-4 font-bold text-slate-200 flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm shadow-inner">
                                          {['🤴','👸','🤠','😎','🤑'][Math.floor(Math.random() * 5)]}
                                     </div>
                                     {win.user}
                                 </td>
                                 <td className="p-4 text-slate-300">{win.game}</td>
                                 <td className="p-4 text-right font-black text-emerald-400">+{win.amount.toLocaleString()}</td>
                                 <td className="p-4 text-right text-slate-500 text-xs">{win.time}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>

             {/* Mobile Card View */}
             <div className="md:hidden p-3 space-y-3">
                  {winners.slice(0, 5).map((win, idx) => (
                      <div key={`${win.id}-m-${idx}`} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center animate-fade-in-up">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                                  {['🤴','👸','🤠','😎','🤑'][idx % 5]}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-white">{win.user}</div>
                                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{win.game}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-emerald-400 font-black text-sm">+{win.amount.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500">NPR</div>
                          </div>
                      </div>
                  ))}
             </div>
         </div>
      </div>
    </div>
  );
};

export default Home;
