import React from 'react';

const Input = ({ label, value, onChange, placeholder }) => (
    <div className="group w-full">
        {label && <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-fuchsia-400 transition-colors">{label}</label>}
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all duration-300 text-sm shadow-inner"
        />
    </div>
);

export default Input;
