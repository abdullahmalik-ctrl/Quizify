import React from 'react';
import { Book, Zap, Sparkles, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.svg';

export default function RenderWelcome({ handleStart, theme }) {
    const isLight = theme === 'light';

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center relative py-12 px-4 md:px-0 overflow-hidden text-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[600px] rounded-full blur-[160px] ${isLight ? 'bg-indigo-400/5' : 'bg-fuchsia-600/10'}`}></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto space-y-16">

                {/* Hero Header */}
                <div className="space-y-6 animate-fade-in-up">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md mb-2 ${isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white/5 border-white/10 text-white/40'}`}>
                        <Sparkles size={12} className="animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Advanced Assessment Suite</span>
                    </div>

                    <h1 className={`text-7xl md:text-9xl font-black tracking-tighter leading-tight ${isLight ? 'text-slate-950' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40'}`}>
                        QUIZIFY<span className="text-fuchsia-500">.</span>
                    </h1>

                    <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                        The professional tool for <span className={`${isLight ? 'text-indigo-600 font-bold' : 'text-white font-bold'}`}>AI-driven exam synthesis</span>.
                        Transform source material into structured tests with clinical precision.
                    </p>
                </div>

                {/* Main Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {[
                        {
                            id: 'book',
                            icon: Book,
                            title: "Document Mode",
                            desc: "Synthesize from notes & PDFs",
                            color: "from-blue-600 to-indigo-600",
                            tag: "Context Aware"
                        },
                        {
                            id: 'topic',
                            icon: Zap,
                            title: "Topic Mode",
                            desc: "Generate via prompt",
                            color: "from-fuchsia-600 to-violet-600",
                            tag: "Zero Input"
                        }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => handleStart(mode.id)}
                            className={`group relative h-72 rounded-[2.5rem] p-10 text-left transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 active:scale-95 ${isLight
                                ? 'bg-white border border-slate-200 shadow-xl'
                                : 'bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 hover:border-white/20 shadow-2xl shadow-black/40'
                                }`}
                        >
                            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-white mb-10 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                <mode.icon size={28} />
                            </div>

                            <div className="space-y-4">
                                <h3 className={`text-3xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>{mode.title}</h3>
                                <p className={`text-sm font-medium ${isLight ? 'text-slate-400' : 'text-white/30'}`}>{mode.desc}</p>
                            </div>

                            <div className={`absolute bottom-10 right-10 h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-500 ${isLight
                                ? 'border-slate-100 text-slate-200 group-hover:border-slate-900 group-hover:text-slate-900 shadow-sm'
                                : 'border-white/5 text-white/10 group-hover:border-white/40 group-hover:text-white'
                                }`}>
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>

                            <div className={`absolute top-10 right-10 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isLight ? 'bg-slate-50 text-slate-400' : 'bg-white/5 text-white/20 group-hover:text-white/40'} transition-colors`}>
                                {mode.tag}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Trust/Status Indicator */}
                <div className={`pt-12 flex items-center justify-center gap-8 ${isLight ? 'text-slate-400' : 'text-white/10'}`}>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"><img src={logo} className={`w-3 h-3 ${isLight ? 'opacity-40 grayscale brightness-0' : 'brightness-0 invert opacity-20'}`} alt="" /> Neural synthesis</div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]"><Sparkles size={14} className={isLight ? 'text-indigo-500/50' : 'text-white/20'} /> 100% Validated</div>
                </div>

            </div>
        </div>
    );
}
