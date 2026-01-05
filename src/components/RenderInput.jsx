import React from 'react';
import { Book, Zap, Upload, Trash2, Sparkles, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Stepper from './ui/Stepper';

const SAMPLE_TEXT = `The mitochondria is the powerhouse of the cell. But honestly, it does way more than just flex energy. It generates most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP). 

Mitochondria contain their own small chromosomes. Generally, mitochondria, and therefore mitochondrial DNA, are inherited only from the mother. This is different from nuclear DNA, which comes from both parents. 

If the mitochondria fails, the cell loses energy and basically ghosts the rest of the body, leading to cell death. This is why mitochondrial diseases are absolutely not a vibe.`;

const SUGGESTED_TOPICS = [
    "Quantum Physics",
    "The Renaissance",
    "Photosynthesis",
    "World War II",
    "Intro to Python",
    "Microeconomics"
];

const RenderInput = ({ mode, setStep, setRawText, rawText, setTopicInput, topicInput, handleTextSubmit }) => {
    const [isParsing, setIsParsing] = React.useState(false);

    const handleContentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const text = await parseFile(file);
            setRawText(text);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsParsing(false);
            e.target.value = null; // Reset input
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">
            <Stepper currentStep="input" />
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" size="sm" onClick={() => setStep('welcome')} className="!p-2 !rounded-xl"><ChevronLeft size={18} /></Button>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{mode === 'book' ? "Source Material" : "Topic Definition"}</h2>
                </div>
            </div>
            {mode === 'book' ? (
                <Card className="min-h-[500px]" title="Input Text" icon={Book}>
                    <div className="absolute top-4 right-6 z-20 flex gap-2">
                        <label className={`cursor-pointer bg-white/10 hover:bg-white/20 text-white/50 hover:text-blue-300 p-2 rounded-xl transition-colors border border-white/10 flex items-center gap-2 ${isParsing ? 'opacity-50 pointer-events-none' : ''}`} title="Upload File">
                            {isParsing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            <span className="text-xs font-bold hidden md:block">{isParsing ? 'Parsing...' : 'Upload PDF/Doc'}</span>
                            <input type="file" accept=".txt,.md,.pdf,.docx" onChange={handleContentUpload} className="hidden" />
                        </label>
                        <div className="w-px h-8 bg-white/10 mx-1"></div>
                        <button onClick={() => setRawText('')} className="bg-white/10 hover:bg-white/20 text-white/50 hover:text-red-300 p-2 rounded-xl transition-colors border border-white/10" title="Clear"><Trash2 size={16} /></button>
                        <button onClick={() => setRawText(SAMPLE_TEXT)} className="bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/20 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 hover:shadow-[0_0_15px_rgba(232,121,249,0.3)]"><Sparkles size={14} /> Quick Fill</button>
                    </div>
                    <textarea className="w-full h-[400px] bg-black/20 border border-white/10 rounded-xl p-5 font-mono text-sm leading-relaxed resize-none text-white/90 placeholder:text-white/20 custom-scrollbar focus:ring-1 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all outline-none backdrop-blur-md" placeholder="Paste your notes..." value={rawText} onChange={(e) => setRawText(e.target.value)} />
                    <div className="text-right text-xs text-white/40 mt-4 flex justify-between items-center px-2">
                        <span className="bg-white/5 px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold text-[10px]">Plain Text</span>
                        <span>{rawText.length} chars</span>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6">
                    <Card title="Subject Matter" icon={Zap}>
                        <Input label="Topic" placeholder="e.g., Quantum Mechanics" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} />
                        <div className="mt-6">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1 block">Suggestions</label>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_TOPICS.map(topic => (
                                    <button key={topic} onClick={() => setTopicInput(topic)} className="text-xs bg-white/5 hover:bg-fuchsia-500/20 hover:text-fuchsia-200 hover:border-fuchsia-500/40 text-white/60 border border-white/10 px-4 py-2 rounded-full transition-all duration-300 font-medium">{topic}</button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            <div className="flex justify-end pt-4"><Button onClick={handleTextSubmit} disabled={(mode === 'book' && !rawText) || (mode === 'topic' && !topicInput)} size="lg">Next Step <ChevronRight size={18} /></Button></div>
        </div>
    );
};

export default RenderInput;
