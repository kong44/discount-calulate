import React from 'react';

interface ResultDisplayProps {
  finalPrice: number;
  savedAmount: number;
  currencySymbol?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ finalPrice, savedAmount, currencySymbol = '$' }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-lg mt-6 space-y-4 transition-opacity duration-500">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Final Price</p>
        <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          {currencySymbol}{finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="bg-green-100 dark:bg-green-500/10 p-4 rounded-md border border-green-200 dark:border-green-500/20">
        <p className="text-sm font-medium text-green-800 dark:text-green-300">You save</p>
        <p className="text-xl font-semibold text-green-600 dark:text-green-300">
          {currencySymbol}{savedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;