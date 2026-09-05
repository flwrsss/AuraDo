import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

interface SwipeableRowProps {
  id: string;
  isPinned?: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
  pinLabel?: string;
  unpinLabel?: string;
  deleteLabel?: string;
  children: React.ReactNode;
  isDark?: boolean;
  className?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  isPinned = false,
  onTogglePin,
  onDelete,
  pinLabel = 'Основная',
  unpinLabel = 'Открепить',
  deleteLabel = 'Удалить',
  children,
  isDark = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Background action opacity based on drag offset
  const actionsOpacity = useTransform(x, [0, -30, -120], [0.3, 0.8, 1]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    // If swiped left past threshold or fast flick left, snap open
    if (info.offset.x < -45 || info.velocity.x < -300) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(20);
    onTogglePin();
    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(30);
    onDelete();
    setIsOpen(false);
  };

  return (
    <div
      ref={constraintsRef}
      className={`relative overflow-hidden rounded-2xl select-none ${className}`}
    >
      {/* Background Revealed Action Buttons (revealed upon swipe left) */}
      <motion.div
        style={{ opacity: actionsOpacity }}
        className="absolute inset-y-0 right-0 flex items-stretch z-0 pr-1 pl-4 my-1"
      >
        {/* Pin as Main Button */}
        <button
          type="button"
          onClick={handlePinClick}
          className={`px-3 sm:px-3.5 my-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 text-white shadow-md ${
            isPinned
              ? 'bg-amber-600 hover:bg-amber-500'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
          title={isPinned ? unpinLabel : pinLabel}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: isPinned ? "'FILL' 1" : "'FILL' 0" }}
          >
            push_pin
          </span>
          <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
            {isPinned ? unpinLabel : pinLabel}
          </span>
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleDeleteClick}
          className="ml-1.5 px-3 sm:px-3.5 my-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md shadow-rose-950/30"
          title={deleteLabel}
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
          <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
            {deleteLabel}
          </span>
        </button>
      </motion.div>

      {/* Foreground Draggable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        animate={{ x: isOpen ? -130 : 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        className={`relative z-10 w-full cursor-grab active:cursor-grabbing ${
          isOpen ? 'shadow-lg' : ''
        }`}
        onClick={() => {
          if (isOpen) setIsOpen(false);
        }}
      >
        <div className="relative">
          {children}

          {/* Subtle Desktop / Click Trigger Button on the right edge */}
          <button
            type="button"
            onClick={handleToggleOpen}
            className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all opacity-40 hover:opacity-100 ${
              isDark
                ? 'text-zinc-400 hover:bg-zinc-800'
                : 'text-zinc-500 hover:bg-zinc-200'
            }`}
            title="Действия (свайп влево)"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isOpen ? 'chevron_right' : 'more_vert'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
