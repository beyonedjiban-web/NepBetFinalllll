
import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { getSupportResponse } from '../services/geminiService';
import { useAppStore } from '../services/store';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Namaste! How can I help you with NepBet today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const context = `User Balance: ${user?.balance || 0} NPR. User Name: ${user?.name || 'Guest'}.`;
    
    const botResponseText = await getSupportResponse(userMsg.text, context);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: botResponseText
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
  };

  return (
    // Updated z-index to 50 to be above other elements
    // Updated bottom positioning: bottom-24 on mobile (to clear nav bar), bottom-6 on desktop
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-900/50 transition-transform hover:scale-110 flex items-center justify-center animate-bounce-short"
          aria-label="Open Chat"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="bg-slate-800 w-[85vw] sm:w-96 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden h-[450px] sm:h-[500px] animate-fade-in-up origin-bottom-right">
          <div className="bg-emerald-600 p-4 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              NepBet AI Support
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-900/50 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-slate-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-4 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for help..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-lg"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
