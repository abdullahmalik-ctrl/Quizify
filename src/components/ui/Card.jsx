import React from 'react';

const Card = ({ children, title, className = '', icon: Icon }) => (
    <div className={`backdrop-blur-2xl bg-slate-900/60 border border-white/10 shadow-2xl rounded-2xl overflow-hidden ${className}`}>
        {title && (
            <div className="border-b border-white/5 px-6 py-4 flex items-center gap-3 bg-white/[0.02]">
                {Icon && <Icon size={18} className="text-fuchsia-500" />}
                <h2 className="text-sm font-bold tracking-widest text-white/80 uppercase">{title}</h2>
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

export default Card;
