import React from 'react';

export const Button = React.forwardRef(
  ({ className = '', variant = 'default', size = 'default', disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      default: 'bg-sky-600 hover:bg-sky-500 text-white',
      ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
      outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300',
      destructive: 'bg-rose-600 hover:bg-rose-500 text-white',
    };
    const sizes = {
      default: 'px-4 py-2 text-sm',
      sm: 'px-3 py-1.5 text-xs',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    };
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
