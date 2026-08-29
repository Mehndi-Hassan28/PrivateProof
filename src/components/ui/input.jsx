import React from 'react';

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 transition-colors ${className}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';
