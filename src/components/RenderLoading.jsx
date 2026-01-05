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

export default function RenderLoading({ loadingMsgIndex }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in relative z-10">
            <div className="relative">
                <div className="absolute inset-0 bg-fuchsia-600/30 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
                <div className="relative backdrop-blur-3xl bg-slate-900/80 p-12 rounded-full border border-white/10 shadow-2xl">
                    <RefreshCw size={64} className="animate-spin text-white" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-tighter">GENERATING...</h2>
                {LOADING_MESSAGES[loadingMsgIndex % LOADING_MESSAGES.length]}
            </div>
        </div>
    );
}

export function RenderGrading({ loadingMsgIndex }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in relative z-10">
            <div className="relative">
                <div className="absolute inset-0 bg-red-600/30 rounded-full blur-[80px] animate-pulse"></div>
                <div className="relative backdrop-blur-3xl bg-slate-900/80 p-12 rounded-full border border-white/10 shadow-2xl">
                    <RefreshCw size={64} className="animate-pulse text-red-400" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-orange-200 tracking-tighter">EVALUATING...</h2>
                {LOADING_MESSAGES[loadingMsgIndex % LOADING_MESSAGES.length]}
            </div>
        </div>
    );
}
