import React, { useState, useRef, useEffect } from 'react';

const SelectContext = React.createContext({});

export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ className = '', children, ...props }) => {
  const { open, setOpen, value } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      className={`flex h-9 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${className}`}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
};

export const SelectValue = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

export const SelectContent = ({ className = '', children }) => {
  const { open, setOpen } = React.useContext(SelectContext);
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 w-full rounded-md border border-slate-700 bg-slate-900 shadow-lg py-1 ${className}`}
    >
      {children}
    </div>
  );
};

export const SelectItem = ({ value: itemValue, className = '', children, ...props }) => {
  const { onValueChange, setOpen } = React.useContext(SelectContext);
  return (
    <div
      className={`px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 cursor-pointer ${className}`}
      onClick={() => { onValueChange(itemValue); setOpen(false); }}
      {...props}
    >
      {children}
    </div>
  );
};
