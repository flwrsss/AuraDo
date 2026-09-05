import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PushNotificationPayload } from '../types';

interface NotificationBannerProps {
  notification: PushNotificationPayload | null;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed top-16 left-4 right-4 max-w-md mx-auto z-50 pointer-events-auto cursor-pointer"
          onClick={onDismiss}
        >
          <div className="rounded-2xl p-3.5 bg-[#14171e]/95 backdrop-blur-2xl border border-cyan-400/40 text-white shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(0,241,253,0.3)] flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7928ca] to-[#00f1fd] text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                  AuraDo Push • {notification.time}
                </span>
                <span className="text-[10px] text-slate-400">сейчас</span>
              </div>
              <h5 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xs mt-0.5 truncate">
                {notification.title}
              </h5>
              <p className="text-[11px] text-[#cec2d6] mt-0.5 line-clamp-2 leading-tight">
                {notification.body}
              </p>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDismiss();
              }}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
