import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportMessage, UserProfile } from '../types';
import { useTranslation } from '../translations';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'm1',
      sender: 'support',
      text: 'Здравствуйте, Елена! Я ассистент технической поддержки AuraDo. Чем я могу помочь вам сегодня?',
      timestamp: '18:25',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: SupportMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Intelligent auto-responder for fitness & bio-rhythm queries
    setTimeout(() => {
      let reply = 'Спасибо за обращение! Ваш запрос принят специалистами команды AuraDo.';
      const lower = text.toLowerCase();

      if (lower.includes('apple') || lower.includes('health') || lower.includes('часы')) {
        reply =
          'Для синхронизации Apple Health перейдите в «Профиль» -> «Интеграции & Устройства» -> нажмите Apple Health и разрешите доступ к чтению активных калорий и пульса.';
      } else if (lower.includes('офлайн') || lower.includes('offline') || lower.includes('интернет')) {
        reply =
          'AuraDo работает полностью в офлайн-режиме: все данные сохраняются в зашифрованном локальном хранилище и автоматически отправляются в облако при появлении связи!';
      } else if (lower.includes('2fa') || lower.includes('безопасность') || lower.includes('код')) {
        reply =
          'Двухфакторная защита (2FA) активна. Для подтверждения сессий используется биометрия Face ID / Touch ID через Apple ID и 6-значный одноразовый код.';
      } else if (lower.includes('экспорт') || lower.includes('pdf') || lower.includes('csv')) {
        reply =
          'Вы можете в любой момент выгрузить отчеты в PDF и CSV форматах на вкладке «Аналитика» нажатием на кнопки в правом верхнем углу.';
      }

      const supportMsg: SupportMessage = {
        id: 'sup_' + Date.now(),
        sender: 'support',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, supportMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full max-w-lg h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl transition-colors border ${
              isDark
                ? 'bg-zinc-900 text-zinc-100 border-zinc-800'
                : 'bg-white text-zinc-900 border-zinc-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base">
                    {t.supportTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span>{t.supportOnline}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : isDark
                        ? 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-750'
                        : 'bg-zinc-100 text-zinc-900 rounded-bl-none border border-zinc-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-400 px-1 mt-0.5">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className={`flex items-center gap-1.5 p-2 rounded-xl w-16 text-blue-400 animate-pulse ${
                  isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className={`px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t ${
              isDark ? 'border-zinc-800' : 'border-zinc-200'
            }`}>
              <button
                type="button"
                onClick={() => handleSend(t.quickFaq1)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border ${
                  isDark ? 'bg-zinc-800 text-blue-400 border-zinc-700 hover:bg-zinc-750' : 'bg-zinc-100 text-blue-600 border-zinc-200'
                }`}
              >
                {t.quickFaq1}
              </button>
              <button
                type="button"
                onClick={() => handleSend(t.quickFaq2)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border ${
                  isDark ? 'bg-zinc-800 text-blue-400 border-zinc-700 hover:bg-zinc-750' : 'bg-zinc-100 text-blue-600 border-zinc-200'
                }`}
              >
                {t.quickFaq2}
              </button>
              <button
                type="button"
                onClick={() => handleSend(t.quickFaq4)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border ${
                  isDark ? 'bg-zinc-800 text-blue-400 border-zinc-700 hover:bg-zinc-750' : 'bg-zinc-100 text-blue-600 border-zinc-200'
                }`}
              >
                {t.quickFaq4}
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className={`p-3 border-t flex items-center gap-2 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={t.typeMessage}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs focus:outline-none border ${
                  isDark
                    ? 'bg-zinc-800 text-white border-zinc-700 focus:border-blue-500'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-blue-500'
                }`}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
