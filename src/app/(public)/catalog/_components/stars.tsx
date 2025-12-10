import type { FC } from "react";

export const Stars: FC<{ value?: number }> = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <span key={i}>★</span>;
        if (i === full && half) return <span key={i}>☆</span>;
        return <span key={i} className="text-gray-300">★</span>;
      })}
    </div>
  );
};
