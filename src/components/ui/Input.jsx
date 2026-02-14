import React from 'react';

const Input = ({ label, value, onChange, placeholder, type = "text", theme, className = "" }) => {
    const isLight = theme === 'light';

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-transparent border-b py-2 text-sm font-bold focus:outline-none transition-colors ${isLight
                        ? 'border-slate-200 text-slate-900 focus:border-indigo-400 placeholder:text-slate-300'
                        : 'border-white/10 text-white focus:border-white/40 placeholder:text-white/20'
                    }`}
            />
        </div>
    );
};

export default Input;
