
import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { EnvelopeIcon, TicketIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const Support: React.FC = () => {
  const { user, createTicket } = useAppStore();
  const [ticket, setTicket] = useState({ subject: '', message: '', priority: 'Medium' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        alert("Please login to submit a ticket.");
        return;
    }
    
    createTicket(ticket.subject, ticket.message, ticket.priority);
    setSubmitted(true);
    
    setTimeout(() => {
        setTicket({ subject: '', message: '', priority: 'Medium' });
        setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-24 md:pb-10">
        {/* Header */}
        <div className="text-center space-y-3 py-6">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">24/7 Support Center</h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
                Need help with deposits, withdrawals, or gameplay? Our team is here to assist you around the clock.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <div className="space-y-6 lg:col-span-1">
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <EnvelopeIcon className="w-24 h-24" />
                    </div>
                    <h3 className="font-bold text-white text-xl mb-4 flex items-center gap-2">
                        <EnvelopeIcon className="w-6 h-6 text-emerald-500" /> Email Support
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        For detailed inquiries, business proposals, or account verification issues.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                        <a href="mailto:contactnepbet@gmail.com" className="text-emerald-400 font-bold hover:text-emerald-300 break-all transition-colors flex items-center gap-2">
                            contactnepbet@gmail.com
                        </a>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <ChatBubbleLeftRightIcon className="w-24 h-24" />
                    </div>
                     <h3 className="font-bold text-white text-xl mb-4 flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" /> Live Chat
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                        Get instant answers from our AI assistant or request a human agent for urgent issues.
                    </p>
                    <button onClick={() => document.querySelector<HTMLButtonElement>('button[aria-label="Open Chat"]')?.click()} className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        Open Chat Bubble &rarr;
                    </button>
                </div>
            </div>

            {/* Ticket Form */}
            <div className="lg:col-span-2">
                <div className="bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-2xl h-full">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700 pb-4">
                        <TicketIcon className="w-7 h-7 text-orange-500" /> Generate Support Ticket
                    </h2>
                    
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in-up min-h-[400px]">
                            <div className="bg-emerald-500/10 p-6 rounded-full mb-6">
                                <CheckCircleIcon className="w-20 h-20 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ticket Submitted Successfully!</h3>
                            <p className="text-slate-400 max-w-md">
                                Your reference ID is <span className="font-mono text-emerald-400">#{Math.floor(Math.random()*100000)}</span>. 
                                We have sent a confirmation to your email. expect a reply within 24 hours.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={user?.name || ''} 
                                        disabled 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-400 font-medium cursor-not-allowed" 
                                        placeholder="Guest User" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={user?.email || ''} 
                                        disabled 
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-400 font-medium cursor-not-allowed" 
                                        placeholder="guest@nepbet.com" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={ticket.subject}
                                    onChange={e => setTicket({...ticket, subject: e.target.value})}
                                    placeholder="e.g., Deposit not reflected"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>

                             <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Priority Level</label>
                                <select 
                                    value={ticket.priority}
                                    onChange={e => setTicket({...ticket, priority: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
                                >
                                    <option>Low - General Question</option>
                                    <option>Medium - Account Issue</option>
                                    <option>High - Transaction Failure</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Describe Issue</label>
                                <textarea 
                                    required
                                    rows={6}
                                    value={ticket.message}
                                    onChange={e => setTicket({...ticket, message: e.target.value})}
                                    placeholder="Please provide transaction IDs or timestamps if applicable..."
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all transform active:scale-[0.98] text-lg">
                                Submit Ticket
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Support;
