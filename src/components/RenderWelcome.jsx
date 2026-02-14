import { Book, Zap, Sparkles, ChevronRight } from 'lucide-react';

export default function RenderWelcome({ handleStart, theme }) {
    const isLight = theme === 'light';
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-16 animate-fade-in-up relative z-10 py-10">
            <div className="relative space-y-6">
                <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] ${isLight ? 'bg-indigo-400/20' : 'bg-fuchsia-600/30'} rounded-full blur-[80px] md:blur-[120px] pointer-events-none`}></div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md shadow-xl mb-4 transition-colors cursor-default group ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <Sparkles size={14} className={`${isLight ? 'text-indigo-600' : 'text-cyan-400'} group-hover:animate-spin`} />
                    <span className={`text-xs font-bold tracking-widest uppercase ${isLight ? 'text-slate-600' : 'text-white/80'}`}>The Future of Assessment</span>
                </div>
                <h1 className={`text-6xl md:text-9xl font-black tracking-tighter drop-shadow-2xl relative z-10 transition-all duration-300 ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40'}`}>
                    QUIZIFY
                </h1>
                <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed px-4 transition-colors duration-300 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                    Transform any content into a <span className="text-fuchsia-400 font-medium">professional exam</span> in seconds.
                    <br className="hidden md:block" />
                    Powered by advanced neural networks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                {[
                    { id: 'book', icon: Book, title: "Document Mode", desc: "Paste notes, articles, or papers", gradient: "from-blue-600/20 to-cyan-600/20", border: "group-hover:border-indigo-500/50", glow: "group-hover:shadow-indigo-500/10" },
                    { id: 'topic', icon: Zap, title: "Topic Mode", desc: "Generate from a simple prompt", gradient: "from-fuchsia-600/20 to-pink-600/20", border: "group-hover:border-fuchsia-500/50", glow: "group-hover:shadow-fuchsia-500/10" }
                ].map((item) => (
                    <button key={item.id} onClick={() => handleStart(item.id)} className="group relative h-64 w-full perspective-1000 active:scale-95 transition-transform duration-200">
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-3xl blur-xl opacity-40 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className={`relative h-full border rounded-3xl p-8 flex flex-col items-center justify-center gap-6 transition-all duration-300 md:group-hover:-translate-y-2 md:group-hover:shadow-2xl ${item.border} ${item.glow} shadow-lg md:shadow-none ${isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10'}`}>
                            <div className={`p-5 rounded-3xl border transition-colors ${isLight ? 'bg-slate-50 border-slate-100 group-hover:bg-slate-100' : 'bg-white/5 border-white/5 group-hover:bg-white/10'}`}>
                                <item.icon size={40} className={`${isLight ? 'text-indigo-600' : 'text-white'} group-hover:scale-110 transition-transform duration-300`} />
                            </div>
                            <div className="space-y-2">
                                <span className={`text-2xl font-bold block tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</span>
                                <span className={`text-sm block font-medium ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{item.desc}</span>
                            </div>
                            <div className={`absolute bottom-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isLight ? 'text-slate-400' : 'text-white/60'}`}>
                                Launch <ChevronRight size={12} />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
