
import React, { useState } from 'react';
import { useAppStore, useNavigate } from '../services/store';
import { MIN_DEPOSIT, MAX_DEPOSIT, MIN_WITHDRAW, ADMIN_WALLETS } from '../constants';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  ClipboardDocumentIcon, 
  CheckCircleIcon,
  PhotoIcon,
  QrCodeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/solid';

const Wallet: React.FC = () => {
  const { user, deposit, withdraw, transactions } = useAppStore();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const navigate = useNavigate();
  
  // Deposit State
  const [selectedMethod, setSelectedMethod] = useState<keyof typeof ADMIN_WALLETS | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(200);
  const [senderNumber, setSenderNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(MIN_WITHDRAW);
  const [walletNumber, setWalletNumber] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'eSewa' | 'Khalti'>('eSewa');

  // Filter transactions for current user only
  const userTransactions = transactions.filter(t => t.userId === user?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    if (!screenshot) {
      alert('Please upload a transaction screenshot.');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate fake processing delay before calling store
    setTimeout(() => {
        deposit(depositAmount, ADMIN_WALLETS[selectedMethod].name, senderNumber, senderName, screenshot.name);
        setIsProcessing(false);
        setDepositSuccess(true);
    }, 2000);
  };

  const resetDeposit = () => {
    setDepositSuccess(false);
    setSelectedMethod(null);
    setDepositAmount(200);
    setSenderNumber('');
    setSenderName('');
    setScreenshot(null);
    setImageError(false);
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();

    const isKycComplete = user?.kyc?.nationalIdNumber && user?.kyc?.address && user?.kyc?.issuedDate;
    
    if (!isKycComplete) {
       if (window.confirm("You must fill your Legal Information (KYC) before withdrawing. Go to Profile now?")) {
           navigate('/profile');
       }
       return;
    }
    
    if (withdrawAmount < MIN_WITHDRAW) {
        alert(`Minimum withdrawal amount is ${MIN_WITHDRAW} NPR`);
        return;
    }

    const success = withdraw(withdrawAmount, walletNumber, withdrawMethod);
    if (success) {
      alert('Withdrawal request submitted!');
      setWalletNumber('');
    } else {
      alert('Insufficient balance!');
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
          case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
          case 'FAILED': return 'bg-red-500/10 text-red-500 border border-red-500/20';
          default: return 'bg-slate-700 text-slate-400';
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in-up pb-24 md:pb-12">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-200 text-xs md:text-sm font-medium mb-1">Total Balance</p>
          <h1 className="text-3xl md:text-5xl font-bold">NPR {user?.balance.toFixed(2) || '0.00'}</h1>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-lg font-medium text-sm md:text-base transition-all flex-1 md:flex-none ${activeTab === 'deposit' ? 'bg-white text-emerald-900' : 'bg-emerald-700/50 hover:bg-emerald-700'}`}
            >
              <ArrowDownTrayIcon className="w-5 h-5" /> Deposit
            </button>
            <button 
              onClick={() => setActiveTab('withdraw')}
              className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-lg font-medium text-sm md:text-base transition-all flex-1 md:flex-none ${activeTab === 'withdraw' ? 'bg-white text-emerald-900' : 'bg-emerald-700/50 hover:bg-emerald-700'}`}
            >
              <ArrowUpTrayIcon className="w-5 h-5" /> Withdraw
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.78-1.66-2.65-1.66-2.12 0-2.42 1.03-2.42 1.5 0 .9.56 1.41 2.67 1.95 2.5.64 4.18 1.71 4.18 3.86.02 1.91-1.25 3.17-3.29 3.53z"/></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Action Panel */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 h-fit overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50">
             <h2 className="text-xl font-bold text-white">
                {activeTab === 'deposit' ? 'Add Funds' : 'Request Withdrawal'}
             </h2>
             <p className="text-xs text-slate-400 mt-1">
                {activeTab === 'deposit' ? 'Secure, fast, and instant deposits.' : 'Withdraw your winnings to your wallet.'}
             </p>
          </div>

          <div className="p-6">
            {activeTab === 'deposit' ? (
              <>
                {depositSuccess ? (
                    <div className="text-center py-8 animate-fade-in-up">
                        <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Deposit Request Submitted</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                            Your transaction is being processed. Funds will be added to your wallet within <span className="text-emerald-400 font-bold">10 minutes</span>.
                        </p>
                        <button onClick={resetDeposit} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                            Make Another Deposit
                        </button>
                    </div>
                ) : (
                    <>
                    {!selectedMethod ? (
                        <div className="space-y-4">
                            <label className="block text-sm text-slate-400 mb-2 font-bold uppercase">Select Payment Method</label>
                            <div className="grid grid-cols-1 gap-3">
                                {Object.values(ADMIN_WALLETS).map((wallet) => (
                                    <button
                                        key={wallet.id}
                                        onClick={() => { setSelectedMethod(wallet.id as any); setImageError(false); }}
                                        className={`flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:border-emerald-500 bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-lg group`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${wallet.color}`}>
                                            {wallet.logo}
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{wallet.name}</div>
                                            <div className="text-xs text-slate-500">Click to view QR & Details</div>
                                        </div>
                                        <QrCodeIcon className="w-6 h-6 text-slate-600 group-hover:text-white" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in-right">
                             <button onClick={() => setSelectedMethod(null)} className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1">
                                 &larr; Back to Methods
                             </button>

                             {/* QR & Admin Details Section */}
                             <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 mb-6">
                                 <div className="flex flex-col items-center justify-center text-center mb-4">
                                     <div className="bg-white p-2 rounded-lg mb-3 shadow-lg relative min-h-[160px] min-w-[160px] flex items-center justify-center">
                                         {/* 
                                           We attempt to load the image. 
                                           If it's a viewer link (not direct image), it might fail (onError).
                                           If it fails, we hide the broken image and show a big button instead.
                                         */}
                                         {!imageError ? (
                                            <img 
                                                src={ADMIN_WALLETS[selectedMethod].qrImage} 
                                                alt={`${ADMIN_WALLETS[selectedMethod].name} QR`} 
                                                className="w-40 h-40 md:w-48 md:h-48 object-contain"
                                                onError={() => setImageError(true)}
                                            />
                                         ) : (
                                             <div className="flex flex-col items-center justify-center h-40 w-40 text-slate-800">
                                                 <QrCodeIcon className="w-12 h-12 mb-2 text-slate-400" />
                                                 <span className="text-xs font-bold text-center">Image unavailable</span>
                                             </div>
                                         )}
                                     </div>
                                     
                                     {/* Always show this button so user can open the real link if the embed fails */}
                                     <a 
                                        href={ADMIN_WALLETS[selectedMethod].qrImage} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-lg font-bold flex items-center gap-1 transition-colors border border-emerald-500/30"
                                     >
                                         <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                         {imageError ? "Click to View Real QR Code" : "Open Full QR Image"}
                                     </a>
                                     
                                     <div className="text-xs text-slate-500 font-bold uppercase mt-3">Scan to Pay with {ADMIN_WALLETS[selectedMethod].name}</div>
                                 </div>
                                 
                                 <div className="space-y-2">
                                     <div className="bg-slate-800 rounded-lg p-3 flex justify-between items-center border border-slate-700">
                                         <div className="overflow-hidden">
                                             <div className="text-[10px] text-slate-400 uppercase font-bold">Send to Number</div>
                                             <div className="text-lg font-mono font-bold text-emerald-400 truncate">{ADMIN_WALLETS[selectedMethod].number}</div>
                                         </div>
                                         <button onClick={() => handleCopy(ADMIN_WALLETS[selectedMethod].number)} className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-slate-300 shrink-0">
                                             <ClipboardDocumentIcon className="w-5 h-5" />
                                         </button>
                                     </div>
                                 </div>
                             </div>

                             {/* User Input Form */}
                             <form onSubmit={handleDepositSubmit} className="space-y-4">
                                 <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-2">Transaction Details</h3>
                                 
                                 <div>
                                    <label className="block text-xs text-slate-400 mb-1 font-bold">Amount (NPR)</label>
                                    <input 
                                        type="number" 
                                        min={MIN_DEPOSIT} 
                                        max={MAX_DEPOSIT}
                                        value={depositAmount}
                                        onChange={e => setDepositAmount(Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white font-bold focus:border-emerald-500 outline-none"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                        <span>Min: {MIN_DEPOSIT}</span>
                                        <span>Max: {MAX_DEPOSIT}</span>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs text-slate-400 mb-1 font-bold">Your Wallet Number</label>
                                         <input 
                                            type="text" 
                                            required
                                            value={senderNumber}
                                            onChange={e => setSenderNumber(e.target.value)}
                                            placeholder="98XXXXXXXX"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs text-slate-400 mb-1 font-bold">Your Wallet Name</label>
                                         <input 
                                            type="text" 
                                            required
                                            value={senderName}
                                            onChange={e => setSenderName(e.target.value)}
                                            placeholder="Your Name"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                                         />
                                     </div>
                                 </div>

                                 <div>
                                     <label className="block text-xs text-slate-400 mb-1 font-bold">Upload Screenshot</label>
                                     <div className="relative">
                                         <input 
                                            type="file" 
                                            accept="image/*"
                                            required
                                            onChange={e => setScreenshot(e.target.files ? e.target.files[0] : null)}
                                            className="hidden"
                                            id="screenshot-upload"
                                         />
                                         <label htmlFor="screenshot-upload" className="flex items-center justify-center gap-2 w-full bg-slate-900 border border-dashed border-slate-600 hover:border-emerald-500 rounded-xl p-4 cursor-pointer text-slate-400 hover:text-white transition-colors">
                                             <PhotoIcon className="w-5 h-5" />
                                             <span className="text-sm">{screenshot ? screenshot.name : 'Click to Upload Proof'}</span>
                                         </label>
                                     </div>
                                 </div>

                                 <button 
                                    type="submit" 
                                    disabled={isProcessing}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-4 rounded-xl font-bold mt-2 shadow-lg shadow-emerald-900/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                 >
                                     {isProcessing ? (
                                         <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Processing...
                                         </>
                                     ) : (
                                         'Submit Deposit'
                                     )}
                                 </button>
                             </form>
                        </div>
                    )}
                    </>
                )}
              </>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4 animate-fade-in-right">
                {(!user?.kyc?.nationalIdNumber) && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex gap-2 items-start text-orange-400 text-xs md:text-sm">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>KYC Incomplete. You cannot withdraw until you fill your legal details in Profile.</span>
                    </div>
                )}
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2 font-bold">Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('eSewa')}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${withdrawMethod === 'eSewa' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                         eSewa
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('Khalti')}
                        className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${withdrawMethod === 'Khalti' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                         Khalti
                      </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 font-bold">Your {withdrawMethod} Number</label>
                  <input 
                    type="text" 
                    value={walletNumber}
                    onChange={e => setWalletNumber(e.target.value)}
                    placeholder={`Enter your ${withdrawMethod} number`}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2 font-bold">Amount (Min: {MIN_WITHDRAW} NPR)</label>
                  <input 
                    type="number" 
                    min={MIN_WITHDRAW} 
                    max={user?.balance}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-emerald-900/50 transition-all active:scale-[0.98]">
                  Request Withdrawal
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <ClockIcon className="w-5 h-5 text-slate-400" />
            Transaction History
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {userTransactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No transactions yet.</p>
            ) : (
              userTransactions.map(tx => (
                <div key={tx.id} className="p-4 bg-slate-900 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                       <div className="flex flex-col">
                         <span className={`text-sm font-bold uppercase ${tx.type === 'DEPOSIT' || tx.type === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>
                           {tx.type}
                         </span>
                         <span className="text-[10px] md:text-xs text-slate-500">{new Date(tx.date).toLocaleString()}</span>
                       </div>
                       <div className="text-right">
                         <span className={`block font-bold ${tx.type === 'DEPOSIT' || tx.type === 'WIN' ? 'text-white' : 'text-slate-300'}`}>
                           {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? '+' : '-'} {tx.amount.toFixed(2)}
                         </span>
                       </div>
                   </div>
                   
                   <div className="flex justify-between items-end">
                       <div className="text-[10px] text-slate-500">
                           {tx.method && <span className="block">Method: {tx.method}</span>}
                           {tx.senderNumber && <span className="block">From: {tx.senderNumber}</span>}
                       </div>
                       <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${getStatusColor(tx.status)}`}>
                         {tx.status}
                       </span>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
