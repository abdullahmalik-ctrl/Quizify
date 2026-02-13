import { Book, Zap, Sparkles, ChevronRight } from 'lucide-react';

export default function RenderWelcome({ handleStart }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-16 animate-fade-in-up relative z-10 py-10">
            <div className="relative space-y-6">
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] bg-fuchsia-600/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl mb-4 hover:bg-white/10 transition-colors cursor-default group">
                    <Sparkles size={14} className="text-cyan-400 group-hover:animate-spin" />
                    <span className="text-xs font-bold text-white/80 tracking-widest uppercase">The Future of Assessment</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 drop-shadow-2xl relative z-10">
                    QUIZIFY
                </h1>
                <p className="text-lg md:text-xl font-light text-white/60 max-w-2xl mx-auto leading-relaxed px-4">
                    Transform any content into a <span className="text-fuchsia-400 font-medium">professional exam</span> in seconds.
                    <br className="hidden md:block" />
                    Powered by advanced neural networks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                {[
                    { id: 'book', icon: Book, title: "Document Mode", desc: "Paste notes, articles, or papers", gradient: "from-blue-600/20 to-cyan-600/20", border: "group-hover:border-cyan-500/50", glow: "group-hover:shadow-cyan-500/20" },
                    { id: 'topic', icon: Zap, title: "Topic Mode", desc: "Generate from a simple prompt", gradient: "from-fuchsia-600/20 to-pink-600/20", border: "group-hover:border-fuchsia-500/50", glow: "group-hover:shadow-fuchsia-500/20" }
                ].map((item) => (
                    <button key={item.id} onClick={() => handleStart(item.id)} className="group relative h-64 w-full perspective-1000 active:scale-95 transition-transform duration-200">
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-[48px] blur-xl opacity-40 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className={`relative h-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[48px] p-8 flex flex-col items-center justify-center gap-6 transition-all duration-300 md:group-hover:-translate-y-2 md:group-hover:shadow-2xl ${item.border} ${item.glow} shadow-lg md:shadow-none`}>
                            <div className="p-5 bg-white/5 rounded-[40px] border border-white/5 group-hover:bg-white/10 transition-colors">
                                <item.icon size={40} className="text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-2xl font-bold text-white block tracking-tight">{item.title}</span>
                                <span className="text-sm text-white/40 block font-medium">{item.desc}</span>
                            </div>
                            <div className="absolute bottom-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                                Launch <ChevronRight size={12} />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
