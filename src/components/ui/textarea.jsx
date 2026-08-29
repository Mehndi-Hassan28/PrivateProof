import React from 'react';

export const Textarea = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`flex w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 transition-colors ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
