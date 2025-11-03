import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  // Fix: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'".
  icon: React.ReactElement;
}

const Input: React.FC<InputProps> = ({ label, icon, ...props }) => {
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
          className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition shadow-sm"
        />
      </div>
    </div>
  );
};

export default Input;
