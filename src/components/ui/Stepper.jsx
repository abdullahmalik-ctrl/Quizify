import React from 'react';

const Stepper = ({ currentStep, theme }) => {
    const isLight = theme === 'light';
    const steps = ['input', 'config', 'loading', 'paper', 'results'];
    const activeIndex = steps.indexOf(currentStep) === -1 ? 2 : steps.indexOf(currentStep);
    return (
        <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= activeIndex ? (isLight ? 'w-12 bg-indigo-600' : 'w-12 bg-gradient-to-r from-fuchsia-500 to-violet-600 shadow-[0_0_10px_rgba(217,70,239,0.5)]') : (isLight ? 'w-2 bg-slate-200' : 'w-2 bg-white/10')}`}></div>
                    {i < steps.length - 1 && <div className="w-2"></div>}
                </div>
            ))}
        </div>
    );
};

export default Stepper;
