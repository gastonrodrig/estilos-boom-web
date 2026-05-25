import React from "react";

interface SummaryCardProps {
    label: string;
    value: string | number;
    colorClass?: string;
}

export const SummaryCard = ({ label, value, colorClass = "text-pink-500" }: SummaryCardProps) => {
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col gap-3 min-w-[200px] flex-1 hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-tight">
                {label}
            </span>
            <span className={`text-4xl font-extrabold tracking-tight ${colorClass}`}>
                {value}
            </span>
        </div>
    );
};
