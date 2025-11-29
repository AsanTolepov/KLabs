import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { askLabAssistant } from "../../services/geminiService";
import { ExperimentType } from "../../types";

interface LabAssistantProps {
  experimentType: ExperimentType;
  contextData: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const LabAssistant: React.FC<LabAssistantProps> = ({ experimentType, contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'model', content: `Salom! Men sizning laborantingizman. ${experimentType.toLowerCase()} tajribasini tushunishda yordam bera olaman. Nimalarni bilmoqchisiz?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Reset chat when experiment changes
  useEffect(() => {
    setMessages([
      { id: 'init-' + experimentType, role: 'model', content: `Hozir biz ${experimentType} ustida ishlayapmiz. Tajriba sozlamalari haqida xohlagan savolingizni bering!` }
    ]);
  }, [experimentType]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const fullContext = `Current Experiment: ${experimentType}. \nDetails: ${contextData}`;
    
    // Prepare history for API (excluding the very first welcome message if needed, or keeping it)
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    const response = await askLabAssistant(userMsg.content, fullContext, history);

    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-neon-purple to-purple-600 p-4 flex justify-between items-center border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <span className="font-bold text-white">AI Laborant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neon-purple text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 border border-slate-200 shadow-sm">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tajriba haqida so'rang..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-neon-purple rounded-lg text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 bg-gradient-to-r from-neon-purple to-purple-600 hover:from-purple-500 hover:to-purple-400 text-white p-4 rounded-full shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105"
      >
        <div className="relative">
           <Sparkles className="w-6 h-6 animate-pulse" />
           <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-purple-600" />
        </div>
        <span className={`font-bold pr-2 ${isOpen ? 'hidden' : 'block'}`}>Yordamchi</span>
      </button>
    </div>
  );
};