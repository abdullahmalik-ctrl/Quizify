import React from 'react';
import { Settings, CheckCircle, Activity, Zap, Layers, PlusCircle, Copy, MinusCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Stepper from './ui/Stepper';

const RenderConfig = ({ config, setConfig, setStep, generatePaper, error, theme }) => {
    const isLight = theme === 'light';
    const updateSection = (index, field, value) => {
        const newSections = [...config.sections];
        newSections[index][field] = value;
        setConfig({ ...config, sections: newSections });
    };

    const addSection = () => {
        const newSection = {
            id: `section_${Date.now()}`,
            type: 'short',
            title: `Section ${String.fromCharCode(65 + config.sections.length)}`,
            count: 1,
            marks: 5
        };
        setConfig({ ...config, sections: [...config.sections, newSection] });
    };

    const duplicateSection = (index) => {
        const sectionToClone = config.sections[index];
        const newSection = {
            ...sectionToClone,
            id: `section_${Date.now()}`,
        };
        const newSections = [...config.sections];
        newSections.splice(index + 1, 0, newSection);
        setConfig({ ...config, sections: newSections });
    };

    const removeSection = (index) => {
        if (config.sections.length <= 1) return;
        const newSections = config.sections.filter((_, i) => i !== index);
        setConfig({ ...config, sections: newSections });
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in relative z-10 px-4 md:px-0">
            <div className="lg:col-span-12"><Stepper currentStep="config" theme={theme} /></div>
            <div className="lg:col-span-4 space-y-6">
                <div className={`flex items-center justify-between mb-4 border-b pb-4 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" size="sm" onClick={() => setStep('input')} className={`!p-2 !rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : ''}`}><ChevronLeft size={18} /></Button>
                        <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Config</h2>
                    </div>
                </div>
                {error && <div className="bg-red-500/20 border border-red-500/30 text-red-100 p-5 rounded-3xl flex items-start gap-3 text-sm font-medium backdrop-blur-md"><AlertTriangle size={18} className="text-red-400 mt-0.5" /> <div>{error}</div></div>}
                <Card title="Global Settings" className="flex flex-col gap-6" icon={Settings} theme={theme}>
                    <div>
                        <label className={`text-[10px] font-bold uppercase mb-3 block tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Difficulty</label>
                        <div className={`grid grid-cols-1 gap-2 p-2 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/10'}`}>
                            {['easy', 'medium', 'hard'].map(level => (
                                <button key={level} onClick={() => setConfig({ ...config, difficulty: level })} className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 border ${config.difficulty === level ? (isLight ? 'bg-white border-indigo-200 shadow-sm' : 'bg-white/10 border-fuchsia-400/50 shadow-inner') : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${config.difficulty === level ? (isLight ? 'bg-indigo-600 text-white' : 'bg-fuchsia-600 text-white') : (isLight ? 'bg-slate-200 text-slate-400' : 'bg-white/10 text-white/40')}`}>{level === 'easy' ? <CheckCircle size={14} /> : level === 'medium' ? <Activity size={14} /> : <Zap size={14} />}</div>
                                        <div className="text-left"><div className={`text-xs font-bold uppercase tracking-wide ${config.difficulty === level ? (isLight ? 'text-slate-900' : 'text-white') : (isLight ? 'text-slate-400' : 'text-white/40')}`}>{level}</div></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={`pt-2 border-t ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                        <label className={`text-[10px] font-bold uppercase mb-3 block tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Duration</label>
                        <div className="flex items-center gap-2 mb-4">
                            {['auto', 'manual'].map(m => (
                                <button key={m} onClick={() => setConfig({ ...config, timerMode: m })} className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all duration-300 ${config.timerMode === m ? (isLight ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.1)]') : (isLight ? 'border-slate-100 text-slate-400 bg-slate-50' : 'border-white/5 text-white/40 hover:bg-white/5')}`}>{m.toUpperCase()}</button>
                            ))}
                        </div>
                        {config.timerMode === 'manual' && (
                            <div className={`flex items-center gap-3 animate-fade-in p-2 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/10'}`}>
                                <input type="number" value={config.manualTime} onChange={(e) => setConfig({ ...config, manualTime: parseInt(e.target.value) || 0 })} className={`w-16 bg-transparent border-none p-2 text-center font-bold text-lg focus:ring-0 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest border-l pl-3 ${isLight ? 'border-slate-200 text-slate-400' : 'border-white/10 text-white/40'}`}>Minutes</span>
                            </div>
                        )}
                    </div>
                    <div className={`pt-2 border-t text-xs ${isLight ? 'border-slate-100 text-slate-400' : 'border-white/10 text-white/40'}`}>
                        <p>Institutional details and personal preferences have been moved to <span className={`${isLight ? 'text-indigo-600' : 'text-fuchsia-400'} font-bold`}>Settings</span> (top right).</p>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
                <Card title="Structure & Content" className="h-full" icon={Layers} theme={theme}>
                    <div className="flex items-center justify-between mb-4">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Exam Sections</p>
                        <button onClick={addSection} className={`text-xs flex items-center gap-1 font-bold transition-colors ${isLight ? 'text-indigo-600 hover:text-indigo-500' : 'text-fuchsia-400 hover:text-fuchsia-300'}`}><PlusCircle size={14} /> Add Group</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        <datalist id="section-titles">
                            {[...new Set(config.sections.map(s => s.title))].map(t => <option key={t} value={t} />)}
                        </datalist>
                        {config.sections.map((section, i) => {
                            const color = section.type === 'mcq' ? (isLight ? "indigo" : "cyan") : (isLight ? "blue" : "pink");
                            const colorHex = section.type === 'mcq' ? (isLight ? "6366f1" : "06b6d4") : (isLight ? "3b82f6" : "ec4899");

                            return (
                                <div key={section.id} className={`p-5 rounded-3xl border transition-all group hover:-translate-y-1 backdrop-blur-md relative ${isLight ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm' : `bg-gradient-to-br from-${section.type === 'mcq' ? 'cyan' : 'pink'}-500/10 to-transparent border-white/10 hover:border-${section.type === 'mcq' ? 'cyan' : 'pink'}-400/40`}`}>
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button onClick={() => duplicateSection(i)} className={`${isLight ? 'text-slate-300 hover:text-indigo-500' : 'text-white/20 hover:text-cyan-400'} transition-colors`} title="Duplicate Group"><Copy size={16} /></button>
                                        {config.sections.length > 1 && (
                                            <button onClick={() => removeSection(i)} className={`${isLight ? 'text-slate-300 hover:text-red-500' : 'text-white/20 hover:text-red-400'} transition-colors`} title="Remove Group"><MinusCircle size={16} /></button>
                                        )}
                                    </div>

                                    <div className="mb-4 pr-6">
                                        <label className={`text-[10px] font-bold uppercase mb-1.5 block ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Section Header (Same Header Groups Questions)</label>
                                        <input
                                            type="text"
                                            list="section-titles"
                                            className={`w-full bg-transparent border-b text-sm font-bold pb-1 focus:outline-none transition-colors ${isLight ? 'border-slate-200 text-slate-900 focus:border-indigo-400' : 'border-white/10 text-white focus:border-white/40'}`}
                                            value={section.title}
                                            onChange={(e) => updateSection(i, 'title', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className={`text-[10px] font-bold uppercase mb-1.5 block ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Type</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateSection(i, 'type', 'mcq')}
                                                className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-2xl border transition-all ${section.type === 'mcq' ? (isLight ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30') : (isLight ? 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100' : 'border-white/5 text-white/30 hover:bg-white/5')}`}
                                            >MCQ</button>
                                            <button
                                                onClick={() => updateSection(i, 'type', 'short')}
                                                className={`flex-1 text-[10px] uppercase font-bold py-1.5 rounded-2xl border transition-all ${section.type !== 'mcq' ? (isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-pink-500/20 text-pink-300 border-pink-500/30') : (isLight ? 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100' : 'border-white/5 text-white/30 hover:bg-white/5')}`}
                                            >Subjective</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className={`text-[10px] font-bold uppercase mb-1.5 block ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Count</label><input type="number" className={`w-full border rounded-2xl p-2.5 text-sm font-mono text-center focus:outline-none transition-colors font-bold shadow-inner ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400' : 'bg-black/30 border-white/10 text-white focus:border-white/40'}`} value={section.count} onChange={e => updateSection(i, 'count', parseInt(e.target.value) || 0)} /></div>
                                        <div><label className={`text-[10px] font-bold uppercase mb-1.5 block ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Marks Each</label><input type="number" className={`w-full border rounded-2xl p-2.5 text-sm font-mono text-center focus:outline-none transition-colors font-bold shadow-inner ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400' : 'bg-black/30 border-white/10 text-white focus:border-white/40'}`} value={section.marks} onChange={e => updateSection(i, 'marks', parseInt(e.target.value) || 0)} /></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={`border-t pt-8 ${isLight ? 'border-slate-100' : 'border-white/10'}`}><Input theme={theme} label="Contextual Focus (Optional)" placeholder="e.g. 'Emphasize definitions'" value={config.specificTopic} onChange={(e) => setConfig({ ...config, specificTopic: e.target.value })} /></div>
                    <Button onClick={generatePaper} variant="primary" size="lg" className="w-full mt-4 !rounded-2xl">Generate Assessment</Button>
                </Card>
            </div>
        </div>
    );
};

export default RenderConfig;
