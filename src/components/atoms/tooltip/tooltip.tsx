'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ITooltipProps {
  children: ReactNode;
  title?: string;
  text?: string;
  content?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'manual';
  open?: boolean;
  wrapperClassName?: string;
  contentClassName?: string;
  showArrow?: boolean;
  arrowClassName?: string;
}

export const Tooltip: React.FC<ITooltipProps> = ({
  children,
  title,
  text,
  content,
  position = 'top',
  trigger = 'hover',
  open,
  wrapperClassName,
  contentClassName,
  showArrow = false,
  arrowClassName,
}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const isControlled = typeof open === 'boolean';
  const visible = isControlled ? open : internalVisible;

  // Clases de posicionamiento estándar
  const positionClasses = {
    top: 'bottom-full right-0 mb-3', // Lo alineamos a la derecha para que crezca hacia la izquierda (centro de la modal)
    bottom: 'top-full right-0 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const handleMouseEnter = () => {
    if (isControlled || trigger !== 'hover') return;
    setInternalVisible(true);
  };

  const handleMouseLeave = () => {
    if (isControlled || trigger !== 'hover') return;
    setInternalVisible(false);
  };

  return (
    <div
      className={wrapperClassName ?? 'relative inline-block'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute z-[9999] ${positionClasses[position]} ${contentClassName ?? ''}`}
          >
            {content ?? (
              <div className="w-64 rounded-xl bg-pink-950 px-4 py-3 text-[11px] text-white shadow-2xl border border-white/10">
                {title && <h4 className="mb-1 font-bold">{title}</h4>}
                {text && <p className="leading-relaxed opacity-90">{text}</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
