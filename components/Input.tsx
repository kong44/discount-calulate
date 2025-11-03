import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  // Fix: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'".
  icon: React.ReactElement;
  actionIcon?: React.ReactElement;
  onActionClick?: () => void;
}

const Input: React.FC<InputProps> = ({ label, icon, actionIcon, onActionClick, ...props }) => {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          {icon}
        </div>
        <input
          {...props}
          className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition shadow-sm"
        />
        {actionIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button type="button" onClick={onActionClick} className="p-1 text-slate-400 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 rounded-full transition" aria-label="Scan price with camera">
              {actionIcon}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;