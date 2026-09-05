import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { useTranslation } from '../translations';
import confetti from 'canvas-confetti';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onToggle2FA: (enabled: boolean) => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onToggle2FA,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [digits, setDigits] = useState(['5', '8', '2', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...digits];
    updated[index] = val;
    setDigits(updated);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setSuccess(true);
      onToggle2FA(!profile.twoFactorEnabled);
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#00f1fd', '#7928ca'],
      });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl transition-colors border ${
              isDark
                ? 'bg-zinc-900 text-zinc-100 border-zinc-800'
                : 'bg-white text-zinc-900 border-zinc-200'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shadow-md border border-blue-500/30">
                <span className="material-symbols-outlined text-[30px]">lock</span>
              </div>

              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg">
                  {t.twoFactorTitle}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{t.twoFactorSubtitle}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div
                className={`p-3 rounded-xl flex items-center justify-between border ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-[18px]">
                    verified_user
                  </span>
                  <span className="text-xs font-semibold">
                    Статус: {profile.twoFactorEnabled ? 'Включена' : 'Отключена'}
                  </span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    profile.twoFactorEnabled ? 'bg-emerald-400' : 'bg-zinc-500'
                  }`}
                />
              </div>

              <div className="space-y-2 text-center">
                <span className="text-xs text-zinc-400">{t.enterCode}</span>
                <div className="flex justify-center gap-2">
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      className={`w-10 h-12 text-center font-bold text-lg rounded-xl border focus:outline-none transition-colors ${
                        digit
                          ? 'border-blue-500 bg-blue-950/30 text-blue-400'
                          : isDark
                          ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                          : 'border-zinc-300 bg-white text-zinc-900'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500">{t.codeSentTo}</p>
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/30 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : success ? (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Успешно подтверждено!</span>
                  </span>
                ) : (
                  <span>{t.verifyCode}</span>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                {t.cancel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
