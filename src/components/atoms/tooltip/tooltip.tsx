'use client';

import { ReactNode, useState } from 'react';

interface ITooltipProps {
  children: ReactNode;
  title?: string;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<ITooltipProps> = ({
  children,
  title,
  text,
  position = 'top',
}: ITooltipProps) => {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          className={`
            absolute z-10 min-w-72
            rounded bg-pink-900 px-3 py-2
            text-sm text-white shadow-lg
            ${positionClasses[position]}
          `}
        >
          {title && (
            <h4 className="mb-1 text-sm font-semibold">
              {title}
            </h4>
          )}
          <p className="leading-snug">{text}</p>
        </div>
      )}
    </div>
  );
}
