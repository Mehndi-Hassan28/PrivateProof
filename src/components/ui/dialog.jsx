import React, { useEffect } from 'react';

export const Dialog = ({ children, open, onOpenChange }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && open) onOpenChange(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className = '', children, ...props }) => (
  <div
    className={`relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const DialogHeader = ({ className = '', children, ...props }) => (
  <div className={`space-y-1.5 mb-4 ${className}`} {...props}>{children}</div>
);

export const DialogTitle = ({ className = '', children, ...props }) => (
  <h2 className={`text-lg font-bold text-white font-heading ${className}`} {...props}>{children}</h2>
);

export const DialogDescription = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-slate-400 ${className}`} {...props}>{children}</p>
);
