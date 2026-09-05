import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { useTranslation } from '../translations';
import confetti from 'canvas-confetti';

interface AppleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSuccessAuth: (email: string) => void;
}

export const AppleAuthModal: React.FC<AppleAuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSuccessAuth,
}) => {
  const { t } = useTranslation(profile.language);
  const isDark = profile.theme === 'dark';

  const [step, setStep] = useState<'prompt' | 'verifying' | 'success'>('prompt');
  const [hideEmail, setHideEmail] = useState(true);

  const handleContinueWithApple = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('success');
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#00f1fd', '#ffffff', '#7928ca'],
      });
      setTimeout(() => {
        onSuccessAuth(hideEmail ? 'elena_privaterelay@icloud.com' : 'elena.rostova@aura.do');
        setStep('prompt');
        onClose();
      }, 1200);
    }, 1500);
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
            {/* Apple Sheet Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shadow-md border border-zinc-700">
                <span className="material-symbols-outlined text-[32px]">apple</span>
              </div>

              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg">
                  {t.appleIdSignIn}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Создайте или свяжите профиль AuraDo с вашим Apple ID
                </p>
              </div>
            </div>

            {step === 'prompt' && (
              <div className="space-y-4 pt-4">
                <div
                  className={`p-3.5 rounded-xl space-y-2 text-xs border ${
                    isDark ? 'bg-zinc-800/80 border-zinc-750 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-400">Имя:</span>
                    <span className="font-bold text-zinc-100">{profile.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-400">Apple ID:</span>
                    <span className="font-medium text-zinc-300">e***@icloud.com</span>
                  </div>
                </div>

                {/* Hide My Email Option */}
                <div
                  onClick={() => setHideEmail(!hideEmail)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer border ${
                    hideEmail
                      ? 'border-blue-500/50 bg-blue-950/20 text-blue-300'
                      : isDark
                      ? 'border-zinc-800 bg-zinc-800/50 text-zinc-400'
                      : 'border-zinc-200 bg-white text-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-400">
                      shield_with_heart
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-100">Скрыть мой e-mail</p>
                      <p className="text-[10px] text-zinc-400">Перенаправлять на iCloud Relay</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-blue-400">
                    {hideEmail ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleContinueWithApple}
                  className="w-full h-11 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                  <span>{t.continueWithApple}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full text-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 pt-1"
                >
                  {t.cancel}
                </button>
              </div>
            )}

            {step === 'verifying' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-blue-400">Проверка Face ID / Apple ID...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[24px] font-bold">check</span>
                </div>
                <p className="text-sm font-bold text-zinc-100">{t.authSuccess}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
