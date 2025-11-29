
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { TransactionType, TransactionStatus } from '../types';
import { 
  UsersIcon, 
  BanknotesIcon, 
  TicketIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

const Admin: React.FC = () => {
  const { transactions, tickets, getAllUsers, approveTransaction, rejectTransaction, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'users' | 'support'>('dashboard');
  const [filter, setFilter] = useState('');
  
  // Security Redirect (Simple check)
  if (!user?.isAdmin) {
      return <div className="p-10 text-center text-red-500 font-bold">ACCESS DENIED</div>;
  }

  const allUsers = getAllUsers();
  const pendingDeposits = transactions.filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.PENDING);
  const pendingWithdrawals = transactions.filter(t => t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.PENDING);
  const totalUserBalance = allUsers.reduce((acc: number, u: any) => acc + u.balance, 0);

  const getFilteredTransactions = () => {
      if(!filter) return transactions;
      return transactions.filter(t => 
          t.id.includes(filter) || 
          t.senderNumber?.includes(filter) ||
          t.userId.includes(filter)
      );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
           <p className="text-slate-400">Manage NepBet Operations</p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl overflow-x-auto max-w-full">
           {['dashboard', 'transactions', 'users', 'support'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-bold text-sm uppercase transition-all whitespace-nowrap ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                 {tab}
              </button>
           ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">{allUsers.length}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Total Users</div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
                        <BanknotesIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">NPR {totalUserBalance.toFixed(2)}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold">User Liability</div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500/20 p-3 rounded-full text-orange-400">
                        <ArrowPathIcon className="w-8 h-8 animate-spin-slow" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">{pendingDeposits.length}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Pending Deposits</div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
                        <TicketIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">{tickets.filter(t => t.status === 'OPEN').length}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Open Tickets</div>
                    </div>
                </div>
            </div>
         </div>
      )}

      {activeTab === 'transactions' && (
         <div className="space-y-6">
             {/* Pending Action Section */}
             {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
                 <div className="bg-slate-800 p-6 rounded-2xl border border-orange-500/30 shadow-xl">
                     <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                        <ExclamationCircleIcon className="w-6 h-6" /> Pending Actions
                     </h2>
                     <div className="space-y-4">
                        {[...pendingDeposits, ...pendingWithdrawals].map(tx => (
                            <div key={tx.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {tx.type}
                                        </span>
                                        <span className="font-mono text-slate-500 text-xs">#{tx.id}</span>
                                    </div>
                                    <div className="text-xl font-black text-white mt-1">NPR {tx.amount}</div>
                                    <div className="text-sm text-slate-400 mt-1">
                                        {tx.type === 'DEPOSIT' ? (
                                            <>
                                                <span className="text-emerald-500 font-bold">{tx.method}</span> • Sender: {tx.senderNumber} ({tx.senderName}) • Proof: {tx.screenshot}
                                            </>
                                        ) : (
                                            <>
                                                Requested to: <span className="text-white font-bold">{tx.details}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-600 mt-1">User ID: {tx.userId} | Date: {new Date(tx.date).toLocaleString()}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => approveTransaction(tx.id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" /> Approve
                                    </button>
                                    <button 
                                        onClick={() => rejectTransaction(tx.id)}
                                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2"
                                    >
                                        <XCircleIcon className="w-5 h-5" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             )}

             {/* All Transactions List */}
             <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                 <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                     <h3 className="font-bold text-white">Transaction History</h3>
                     <div className="relative">
                         <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                         <input 
                            type="text" 
                            placeholder="Search ID/Phone..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                         />
                     </div>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-slate-400">
                         <thead className="bg-slate-900 text-slate-200 uppercase text-xs font-bold">
                             <tr>
                                 <th className="p-4">ID</th>
                                 <th className="p-4">Type</th>
                                 <th className="p-4">User</th>
                                 <th className="p-4">Amount</th>
                                 <th className="p-4">Status</th>
                                 <th className="p-4">Details</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-700">
                             {getFilteredTransactions().map(tx => (
                                 <tr key={tx.id} className="hover:bg-slate-700/30">
                                     <td className="p-4 font-mono text-xs text-slate-500">#{tx.id.slice(-6)}</td>
                                     <td className="p-4 font-bold">
                                         <span className={tx.type === 'DEPOSIT' || tx.type === 'WIN' ? 'text-emerald-400' : 'text-red-400'}>{tx.type}</span>
                                     </td>
                                     <td className="p-4 text-xs">{tx.userId.slice(-6)}</td>
                                     <td className="p-4 font-bold text-white">{tx.amount.toFixed(2)}</td>
                                     <td className="p-4">
                                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${tx.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 
                                              tx.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                             {tx.status}
                                         </span>
                                     </td>
                                     <td className="p-4 text-xs max-w-xs truncate">
                                         {tx.method} {tx.senderNumber} {tx.details}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
         </div>
      )}

      {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
               <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-slate-400">
                         <thead className="bg-slate-900 text-slate-200 uppercase text-xs font-bold">
                             <tr>
                                 <th className="p-4">User ID</th>
                                 <th className="p-4">Name</th>
                                 <th className="p-4">Phone</th>
                                 <th className="p-4">Balance</th>
                                 <th className="p-4">KYC Status</th>
                                 <th className="p-4">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-700">
                             {allUsers.filter(u => !u.isAdmin).map(u => (
                                 <tr key={u.id} className="hover:bg-slate-700/30">
                                     <td className="p-4 font-mono text-xs">#{u.id}</td>
                                     <td className="p-4 font-bold text-white">{u.name}</td>
                                     <td className="p-4">{u.phone}</td>
                                     <td className="p-4 text-emerald-400 font-bold">{u.balance.toFixed(2)}</td>
                                     <td className="p-4">
                                         {u.kyc ? (
                                             <span className="text-emerald-400 flex items-center gap-1 text-xs"><CheckCircleIcon className="w-4 h-4"/> Verified</span>
                                         ) : (
                                             <span className="text-orange-400 text-xs">Pending</span>
                                         )}
                                     </td>
                                     <td className="p-4">
                                         <button className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 text-white">View</button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
          </div>
      )}

      {activeTab === 'support' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden p-6">
              <h2 className="text-xl font-bold text-white mb-6">Support Tickets</h2>
              <div className="space-y-4">
                  {tickets.length === 0 ? <div className="text-center text-slate-500 py-10">No tickets found.</div> : (
                      tickets.map(ticket => (
                          <div key={ticket.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 hover:border-emerald-500/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <h3 className="font-bold text-white text-lg">{ticket.subject}</h3>
                                      <div className="text-xs text-slate-400">
                                          By: {ticket.userName} (ID: {ticket.userId.slice(-6)}) • {new Date(ticket.date).toLocaleString()}
                                      </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${ticket.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                          {ticket.status}
                                      </span>
                                      <span className="text-xs font-bold text-orange-400">{ticket.priority}</span>
                                  </div>
                              </div>
                              <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                                  {ticket.message}
                              </p>
                              <div className="mt-3 flex gap-2">
                                  <button className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded">Reply</button>
                                  <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded">Close Ticket</button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

// Helper for Icon in Transactions
const ExclamationCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
);

export default Admin;
