import React from 'react';

const Card = ({ title, icon: Icon, children, className = "", theme, variant = "glass" }) => {
    const isLight = theme === 'light';

    // Variant styles
    const baseStyles = "rounded-3xl p-6 shadow-xl border transition-all duration-300";

    // Glass Styles: White glass in light mode, Dark glass in dark mode
    const glassStyles = isLight
        ? 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-sm'
        : 'm3-glass-dark border-white/10 shadow-2xl';

    // Default/Solid Styles: Clean white in light, deep slate in dark (but user wants glassy globally, so we'll use glass as default often)
    const activeStyles = variant === 'glass' ? glassStyles : (isLight ? 'bg-white border-slate-200' : 'bg-[#1e293b] border-white/10');

    const containerClass = `${baseStyles} ${activeStyles} ${className}`;

    return (
        <div className={containerClass}>
            {(title || Icon) && (
                <div className={`flex items-center gap-3 mb-6 pb-4 border-b border-dashed ${isLight ? 'border-gray-200/50' : 'border-white/10'}`}>
                    {Icon && (
                        <div className={`p-2 rounded-2xl ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-white/10 text-white'}`}>
                            <Icon size={20} />
                        </div>
                    )}
                    {title && (
                        <h3 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {title}
                        </h3>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
