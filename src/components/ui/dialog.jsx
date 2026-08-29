import React, { useEffect } from 'react';

export const Dialog = ({ children, open, onOpenChange }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && open) onOpenChange(false); };
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl scrollbar-none shadow-2xl">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className = '', children, ...props }) => (
  <div
    className={`relative bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-8 w-full ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const DialogHeader = ({ className = '', children, ...props }) => (
  <div className={`space-y-1.5 mb-4 ${className}`} {...props}>{children}</div>
);

export const DialogTitle = ({ className = '', children, ...props }) => (
  <h2 className={`text-lg sm:text-xl font-extrabold text-white font-heading ${className}`} {...props}>{children}</h2>
);

export const DialogDescription = ({ className = '', children, ...props }) => (
  <p className={`text-xs sm:text-sm text-slate-400 font-sans leading-relaxed ${className}`} {...props}>{children}</p>
);
