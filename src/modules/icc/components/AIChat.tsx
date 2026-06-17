import { useState, useRef, useEffect } from 'react';
import { useIccStore } from '../store/useIccStore';
import { getAIResponse, SUGGESTED_PROMPTS } from '../services/mockAIResponses';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const DEFAULT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AIChat() {
  const { messages, addMessage, clearChat } = useIccStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    addMessage({ role: 'user', content: msg });
    setInput('');
    setIsTyping(true);

    const delay = 500 + Math.random() * 1000;
    setTimeout(() => {
      const aiMsg = getAIResponse(msg);
      addMessage(aiMsg);
      setIsTyping(false);
    }, delay);
  };

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 flex flex-col h-[500px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
          <h3 className="text-sm font-semibold text-surface-200/80">FIFA AI Pro</h3>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-surface-200/40 hover:text-surface-200/70 transition-colors"
        >
          Limpar
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <p className="text-sm text-surface-200/50 mb-1">Como posso ajudar?</p>
            <p className="text-xs text-surface-200/30">Pergunte sobre ataque, defesa, formacao, estrategia...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-slide-up ${msg.role === 'user' ? 'flex justify-end' : ''}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-surface-700/50 text-surface-200/90 rounded-bl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>

              {msg.chartData && (
                <div className="mt-3 h-32">
                  <ResponsiveContainer>
                    <BarChart
                      data={msg.chartData.data.map((v, j) => ({
                        name: `${j + 1}`,
                        value: v,
                      }))}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {msg.chartData.data.map((_, j) => (
                          <Cell
                            key={j}
                            fill={DEFAULT_COLORS[j % DEFAULT_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-surface-200/30'}`}>
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-1 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-surface-200/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-surface-200/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-surface-200/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-700/50 text-surface-200/60 hover:bg-surface-700 hover:text-surface-200/80 transition-colors border border-surface-700/50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-surface-700/50">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-surface-900/50 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-200/30 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte sobre o jogo..."
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-surface-700 disabled:text-surface-200/30 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
