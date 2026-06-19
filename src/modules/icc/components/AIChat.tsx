import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useIccStore, type AIModel } from '../store/useIccStore';
import {
  getAIResponse,
  SUGGESTED_PROMPTS,
  getModelLabels,
  MODEL_COLORS,
} from '../services/mockAIResponses';

const TYPEWRITER_SPEED = 18;

interface SearchPhase {
  text: string;
  icon: string;
}

function getSearchPhases(t: (key: string) => string): SearchPhase[] {
  return [
    { text: t('icc.chat.search_phases.0'), icon: '🔍' },
    { text: t('icc.chat.search_phases.1'), icon: '📊' },
    { text: t('icc.chat.search_phases.2'), icon: '🔗' },
    { text: t('icc.chat.search_phases.3'), icon: '✅' },
  ];
}

interface TypingMessage {
  fullText: string;
  displayedText: string;
  reasoningText: string;
  currentPhase: number;
  phaseComplete: boolean;
  reasoningComplete: boolean;
  model: AIModel;
  chartData?: { label: string; data: number[] };
  isComplete: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n- /g, '</p><p class="ml-3">- ')
    .replace(/\n\d+\./g, (match) => `</p><p class="ml-3">${match.trim()}`);
}

export default function AIChat() {
  const { t } = useTranslation();
  const { messages, addMessage, clearChat } = useIccStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingMsg, setTypingMsg] = useState<TypingMessage | null>(null);
  const [searchPhaseIndex, setSearchPhaseIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const phaseIntervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingMsg, scrollToBottom, searchPhaseIndex]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    };
  }, []);

  const SEARCH_PHASES = getSearchPhases(t);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    addMessage({ role: 'user', content: msg });
    setInput('');
    setIsTyping(true);
    setSearchPhaseIndex(0);

    let phase = 0;
    phaseIntervalRef.current = setInterval(() => {
      phase++;
      if (phase < SEARCH_PHASES.length) {
        setSearchPhaseIndex(phase);
      } else {
        if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
        setSearchPhaseIndex(-1);

        const aiMsg = getAIResponse(msg);

        setTypingMsg({
          fullText: aiMsg.content,
          displayedText: '',
          reasoningText: aiMsg.reasoning ?? '',
          currentPhase: 0,
          phaseComplete: false,
          reasoningComplete: false,
          model: aiMsg.model ?? 'tatico',
          chartData: aiMsg.chartData,
          isComplete: false,
        });

        let charIndex = 0;
        const fullReasoning = aiMsg.reasoning ?? '';

        intervalRef.current = setInterval(() => {
          setTypingMsg((prev) => {
            if (!prev) return null;

            if (!prev.reasoningComplete) {
              charIndex++;
              if (charIndex <= fullReasoning.length) {
                return {
                  ...prev,
                  reasoningText: fullReasoning.slice(0, charIndex),
                };
              }
              return { ...prev, reasoningComplete: true };
            }

            const currentCharIndex = prev.displayedText.length + 1;
            if (currentCharIndex <= prev.fullText.length) {
              return {
                ...prev,
                displayedText: prev.fullText.slice(0, currentCharIndex),
              };
            }

            if (intervalRef.current) clearInterval(intervalRef.current);

            const finalMsg = {
              role: 'ai' as const,
              content: prev.fullText,
              reasoning: prev.reasoningText,
              model: prev.model,
              chartData: prev.chartData,
            };

            setTimeout(() => {
              addMessage(finalMsg);
              setTypingMsg(null);
              setIsTyping(false);
            }, 80);

            return { ...prev, isComplete: true };
          });
        }, TYPEWRITER_SPEED);
      }
    }, 350);
  };

  const renderModelBadge = (model: AIModel) => {
    const labels = getModelLabels();
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
        style={{
          backgroundColor: `${MODEL_COLORS[model]}20`,
          color: MODEL_COLORS[model],
        }}
      >
        {labels[model]}
      </span>
    );
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
          {t('icc.chat.clear')}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !typingMsg && searchPhaseIndex === -1 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <p className="text-sm text-surface-200/50 mb-1">{t('icc.chat.empty_title')}</p>
            <p className="text-xs text-surface-200/30">{t('icc.chat.empty_hint')}</p>
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
              {msg.role === 'ai' && msg.model && (
                <div className="mb-1.5">{renderModelBadge(msg.model)}</div>
              )}

              {msg.role === 'ai' && msg.reasoning && (
                <p className="text-[11px] text-surface-200/40 italic mb-2 border-l-2 border-surface-600 pl-2">
                  {msg.reasoning}
                </p>
              )}

              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />

              {msg.chartData && (
                <div className="mt-3 p-2 bg-surface-900/50 rounded-lg">
                  <p className="text-[10px] text-surface-200/50 font-medium">{msg.chartData.label}</p>
                  <div className="flex items-end gap-1 mt-1 h-12">
                    {msg.chartData.data.map((v, j) => {
                      const max = Math.max(...msg.chartData!.data);
                      const height = max > 0 ? (v / max) * 100 : 0;
                      return (
                        <div
                          key={j}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${height}%`,
                            backgroundColor: MODEL_COLORS[msg.model ?? 'tatico'],
                            opacity: 0.6 + (j / msg.chartData!.data.length) * 0.4,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-surface-200/30'}`}>
                {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {searchPhaseIndex >= 0 && (
          <div className="animate-slide-up flex gap-2 items-center px-3 py-2">
            <div className="flex gap-1">
              {SEARCH_PHASES.map((_phase, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i <= searchPhaseIndex ? 'bg-emerald-400' : 'bg-surface-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-surface-200/50">
              {SEARCH_PHASES[searchPhaseIndex].icon} {SEARCH_PHASES[searchPhaseIndex].text}...
            </span>
          </div>
        )}

        {typingMsg && (
          <div className="animate-slide-up">
            <div className="max-w-[85%] rounded-xl px-3 py-2.5 bg-surface-700/50 text-surface-200/90 rounded-bl-sm">
              {renderModelBadge(typingMsg.model)}

              {!typingMsg.reasoningComplete && typingMsg.reasoningText && (
                <p className="text-[11px] text-surface-200/40 italic mt-1.5 mb-2 border-l-2 border-surface-600 pl-2">
                  {typingMsg.reasoningText}
                  {!typingMsg.isComplete && (
                    <span className="inline-block w-0.5 h-3 bg-brand-400 ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </p>
              )}

              {typingMsg.reasoningComplete && (
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(typingMsg.displayedText) }}
                />
              )}

              {typingMsg.reasoningComplete && !typingMsg.isComplete && (
                <span className="inline-block w-0.5 h-4 bg-brand-400 ml-0.5 animate-pulse align-text-bottom" />
              )}

              {typingMsg.isComplete && typingMsg.chartData && (
                <div className="mt-3 p-2 bg-surface-900/50 rounded-lg animate-fade-in">
                  <p className="text-[10px] text-surface-200/50 font-medium">{typingMsg.chartData.label}</p>
                  <div className="flex items-end gap-1 mt-1 h-12">
                    {typingMsg.chartData.data.map((v, j) => {
                      const max = Math.max(...typingMsg.chartData!.data);
                      const height = max > 0 ? (v / max) * 100 : 0;
                      return (
                        <div
                          key={j}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${height}%`,
                            backgroundColor: MODEL_COLORS[typingMsg.model],
                            opacity: 0.6 + (j / typingMsg.chartData!.data.length) * 0.4,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isTyping && searchPhaseIndex === -1 && !typingMsg && (
          <div className="flex gap-1 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-surface-200/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-surface-200/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-surface-200/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {messages.length === 0 && !typingMsg && searchPhaseIndex === -1 && (
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
            placeholder={t('icc.chat.placeholder')}
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-surface-700 disabled:text-surface-200/30 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('icc.chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
