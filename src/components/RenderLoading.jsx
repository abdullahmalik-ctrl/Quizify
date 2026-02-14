import { RefreshCw } from 'lucide-react';

const LOADING_MESSAGES = [
    "Consulting the AI Examiner...",
    "Analyzing your academic potential...",
    "Scanning for keywords...",
    "Calculating GPA damage...",
    "Comparing against model answers...",
    "Detecting brilliance (or lack thereof)...",
    "Generating detailed feedback...",
    "Checking the marking scheme...",
    "Synthesizing results..."
];

export default function RenderLoading({ loadingMsgIndex, theme, isGrading }) {
    const isLight = theme === 'light';
    const accentColor = isGrading ? (isLight ? 'text-red-600' : 'text-red-400') : (isLight ? 'text-indigo-600' : 'text-white');
    const glowColor = isGrading ? (isLight ? 'bg-red-400/20' : 'bg-red-600/30') : (isLight ? 'bg-indigo-400/20' : 'bg-fuchsia-600/30');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in relative z-10">
            <div className="relative">
                <div className={`absolute inset-0 ${glowColor} rounded-full blur-[100px] opacity-60 animate-pulse`}></div>
                <div className={`relative backdrop-blur-3xl p-12 rounded-full border shadow-2xl transition-colors duration-500 ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-white/10'}`}>
                    <RefreshCw size={64} className={`animate-spin ${accentColor}`} />
                </div>
            </div>
            <div className={`text-center space-y-2 font-black tracking-widest uppercase`}>
                <h2 className={`text-3xl tracking-tighter transition-colors duration-500 ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50'}`}>
                    {isGrading ? 'EVALUATING...' : 'GENERATING...'}
                </h2>
                <p className={`text-xs font-bold transition-colors duration-500 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                    {LOADING_MESSAGES[loadingMsgIndex % LOADING_MESSAGES.length]}
                </p>
            </div>
        </div>
    );
}

// Keep separate export for backward compatibility if needed, but App.jsx uses RenderLoading with isGrading prop
export function RenderGrading(props) {
    return <RenderLoading {...props} isGrading={true} />;
}
