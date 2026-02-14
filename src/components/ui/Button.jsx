import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, size = 'md', id, title }) => {
    const base = "font-extrabold tracking-wide transition-all duration-300 rounded-full active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none relative overflow-hidden group";
    const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" };
    const variants = {
        primary: "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-fuchsia-500/40 border border-white/20 hover:shadow-fuchsia-500/60 hover:border-white/40",
        secondary: "bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/90 border border-white/10 hover:border-white/20 hover:shadow-lg",
        ghost: "bg-transparent backdrop-blur-none hover:backdrop-blur-sm text-white/60 hover:text-white hover:bg-white/5",
        danger: "bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50",
        dark: "bg-slate-950 text-white border border-white/10 hover:bg-black hover:border-white/20 shadow-xl"
    };

    return (
        <button id={id} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} title={title}>
            {variant === 'primary' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>}
            {children}
        </button>
    );
};

export default Button;
