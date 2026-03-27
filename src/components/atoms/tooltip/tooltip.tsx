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
}: ITooltipProps) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const isControlled = typeof open === 'boolean';
  const visible = isControlled ? open : internalVisible;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPositionClasses = {
    top: 'left-1/2 top-full -translate-x-1/2 -translate-y-1/2 border-r border-b',
    bottom: 'left-1/2 bottom-full -translate-x-1/2 translate-y-1/2 border-l border-t',
    left: 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-t',
    right: 'right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-l border-b',
  };

  const handleMouseEnter = () => {
    if (isControlled || trigger !== 'hover') return;
    setInternalVisible(true);
  };

  const handleMouseLeave = () => {
    if (isControlled || trigger !== 'hover') return;
    setInternalVisible(false);
  };

  const handleClick = () => {
    if (isControlled || trigger !== 'click') return;
    setInternalVisible((prev) => !prev);
  };

  return (
    <div
      className={wrapperClassName ?? 'relative inline-block'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              absolute z-10
              ${positionClasses[position]}
              ${contentClassName ?? ''}
            `}
          >
            {showArrow && (
              <div
                className={
                  arrowClassName ??
                  `absolute h-3 w-3 rotate-45 border border-pink-900 bg-pink-900 ${arrowPositionClasses[position]}`
                }
              />
            )}

            {content ?? (
              <div className="min-w-64 rounded-2xl bg-pink-900/95 backdrop-blur-sm px-4 py-3 text-sm text-white shadow-xl border border-pink-800/20">
                {title && (
                  <h4 className="mb-1 text-sm font-bold tracking-tight">
                    {title}
                  </h4>
                )}
                {text ? <p className="leading-relaxed opacity-95">{text}</p> : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
