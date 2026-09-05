import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { useTranslation } from '../translations';
import { NotificationService } from '../services/notifications';
import confetti from 'canvas-confetti';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onDispatchPush: (title: string, body: string, category: string) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  profile,
  onDispatchPush,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [campaignTitle, setCampaignTitle] = useState('Пик энергии AuraDo');
  const [campaignBody, setCampaignBody] = useState(
    'Ваш био-ритм достиг дневного оптимума. Идеальное время для силовой или кардио тренировки!'
  );
  const [targetSegment, setTargetSegment] = useState<'all' | 'pro' | 'inactive'>('pro');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ count: number; id: string } | null>(null);

  const handleSend = () => {
    setIsSending(true);
    NotificationService.requestPermission().then(() => {
      setTimeout(() => {
        const res = NotificationService.dispatchBroadcastCampaign(
          campaignTitle,
          campaignBody,
          targetSegment
        );
        onDispatchPush(campaignTitle, campaignBody, 'bio-sync');
        setIsSending(false);
        setResult({ count: res.sentCount, id: res.campaignId });

        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#00f1fd', '#7928ca'],
        });

        setTimeout(() => {
          setResult(null);
          onClose();
        }, 2200);
      }, 1000);
    });
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl transition-colors border ${
              isDark
                ? 'bg-zinc-900 text-zinc-100 border-zinc-800'
                : 'bg-white text-zinc-900 border-zinc-200'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">campaign</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base">
                    {t.broadcastApi}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Автоматическая рассылка push-сигналов</p>
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

            <div className="space-y-4 pt-4 text-xs">
              {/* Target Segment */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Целевой сегмент пользователей:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetSegment('all')}
                    className={`py-2 rounded-xl text-center font-bold border transition-all ${
                      targetSegment === 'all'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : isDark
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    Все (1,420)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSegment('pro')}
                    className={`py-2 rounded-xl text-center font-bold border transition-all ${
                      targetSegment === 'pro'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : isDark
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    PRO (840)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSegment('inactive')}
                    className={`py-2 rounded-xl text-center font-bold border transition-all ${
                      targetSegment === 'inactive'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : isDark
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    Удержание (580)
                  </button>
                </div>
              </div>

              {/* Title & Body Inputs */}
              <div className="space-y-2">
                <div>
                  <label className="text-zinc-400 font-semibold">Заголовок оповещения:</label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={e => setCampaignTitle(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded-xl focus:outline-none border ${
                      isDark
                        ? 'bg-zinc-800 text-white border-zinc-700 focus:border-blue-500'
                        : 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Текст уведомления:</label>
                  <textarea
                    rows={2}
                    value={campaignBody}
                    onChange={e => setCampaignBody(e.target.value)}
                    className={`w-full mt-1 p-3 rounded-xl focus:outline-none border ${
                      isDark
                        ? 'bg-zinc-800 text-white border-zinc-700 focus:border-blue-500'
                        : 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* iOS Live Notification Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">Превью на экране iOS:</span>
                <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 flex items-start gap-3 shadow-md">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-blue-400">AuraDo • Сейчас</span>
                      <span className="text-[10px] text-zinc-400">18:30</span>
                    </div>
                    <p className="font-bold text-xs mt-0.5">{campaignTitle}</p>
                    <p className="text-[11px] text-zinc-300 mt-0.5 leading-tight">{campaignBody}</p>
                  </div>
                </div>
              </div>

              {result && (
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500 text-blue-300 flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>
                    Отправлено {result.count} пользователям! ID: {result.id}
                  </span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !!result}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/30 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                    <span>Запустить рассылку в AuraDo Network</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
