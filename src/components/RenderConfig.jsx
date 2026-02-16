import React from 'react';
import { Settings, CheckCircle2, Activity, Zap, Layers, Plus, Copy, Trash2, ChevronLeft, AlertTriangle, Clock, BookOpen, FileText, AlignLeft, Minus } from 'lucide-react';
import Button from './ui/Button';

// Internal Stepper Component for Quantity/Marks/Time
const StepperInput = ({ value, onChange, min = 1, max = 100, label, theme, suffix }) => {
    const isLight = theme === 'light';

    const handleIncrement = () => {
        if (value < max) onChange(value + 1);
    };

    const handleDecrement = () => {
        if (value > min) onChange(value - 1);
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        if (newValue === '') {
            onChange(''); // Allow empty while typing
            return;
        }
        const parsed = parseInt(newValue);
        if (!isNaN(parsed)) {
            onChange(parsed);
        }
    };

    const handleBlur = () => {
        let finalValue = parseInt(value);
        if (isNaN(finalValue)) finalValue = min;
        if (finalValue < min) finalValue = min;
        if (finalValue > max) finalValue = max;
        onChange(finalValue);
    };

    return (
        <div className="flex flex-col items-center w-full">
            {label && <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{label}</span>}
            <div className={`flex items-center justify-between p-1 rounded-xl border w-full ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/10'}`}>
                <button
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className={`p-3 rounded-lg transition-all ${value <= min
                        ? 'opacity-30 cursor-not-allowed'
                        : isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-white'
                        }`}
                >
                    <Minus size={16} strokeWidth={3} />
                </button>

                <div className="flex-1 flex items-center justify-center relative">
                    <input
                        type="number"
                        value={value}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full bg-transparent text-center font-bold text-lg focus:outline-none appearance-none ${isLight ? 'text-slate-900' : 'text-white'}`}
                        style={{ MozAppearance: 'textfield' }} // Remove spin buttons in Firefox
                    />
                    {suffix && <span className={`absolute right-2 text-sm font-medium pointer-events-none ${isLight ? 'text-slate-400' : 'text-white/40'}`}>{suffix}</span>}
                </div>

                <button
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className={`p-3 rounded-lg transition-all ${value >= max
                        ? 'opacity-30 cursor-not-allowed'
                        : isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-white'
                        }`}
                >
                    <Plus size={16} strokeWidth={3} />
                </button>
            </div>
            <style jsx>{`
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

const RenderConfig = ({ config, setConfig, setStep, generatePaper, error, theme }) => {
    const isLight = theme === 'light';

    // Calculate total questions and marks for sticky footer
    const totalQuestions = config.sections.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);
    const totalMarks = config.sections.reduce((acc, curr) => acc + ((parseInt(curr.count) || 0) * (parseInt(curr.marks) || 0)), 0);

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
        <div className={`w-full max-w-5xl mx-auto pb-40 animate-fade-in relative z-10 ${isLight ? 'text-slate-800' : 'text-white'}`}>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-4 md:px-0 pt-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setStep('input')}
                        className={`p-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${isLight ? 'bg-white shadow-lg text-slate-700 hover:bg-slate-50' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1">Configuration</h1>
                        <p className={`text-sm font-medium ${isLight ? 'text-slate-500' : 'text-white/60'}`}>Customize your assessment parameters</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-8 mx-4 md:mx-0 animate-shake">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md">
                        <AlertTriangle size={20} />
                        <span className="font-bold">{error}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-0">
                {/* Left Column: Global Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`p-6 rounded-[2rem] border backdrop-blur-xl shadow-2xl transition-all duration-500 ${isLight ? 'bg-white/80 border-slate-200/60 shadow-indigo-100/50' : 'bg-black/40 border-white/10 shadow-black/20'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
                                <Settings size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Global Settings</h2>
                        </div>

                        {/* Difficulty */}
                        <div className="mb-8">
                            <label className={`text-xs font-bold uppercase tracking-widest mb-4 block ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Difficulty Level</label>
                            <div className="space-y-2">
                                {['easy', 'medium', 'hard'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setConfig({ ...config, difficulty: level })}
                                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 group ${config.difficulty === level
                                            ? (isLight ? 'bg-indigo-50 border-indigo-200 shadow-md transform scale-[1.02]' : 'bg-fuchsia-500/20 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] transform scale-[1.02]')
                                            : (isLight ? 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10')
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${config.difficulty === level
                                                ? (isLight ? 'bg-indigo-500 text-white' : 'bg-fuchsia-500 text-white')
                                                : (isLight ? 'bg-slate-200 text-slate-400 group-hover:bg-slate-300' : 'bg-white/10 text-white/40 group-hover:bg-white/20')
                                                }`}>
                                                {level === 'easy' && <CheckCircle2 size={14} strokeWidth={3} />}
                                                {level === 'medium' && <Activity size={14} strokeWidth={3} />}
                                                {level === 'hard' && <Zap size={14} strokeWidth={3} />}
                                            </div>
                                            <span className={`font-bold capitalize ${config.difficulty === level
                                                ? (isLight ? 'text-indigo-700' : 'text-white')
                                                : (isLight ? 'text-slate-500' : 'text-white/50')
                                                }`}>{level}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Timer */}
                        <div>
                            <label className={`text-xs font-bold uppercase tracking-widest mb-4 block ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Time Limit</label>
                            <div className={`p-1.5 rounded-2xl flex relative mb-4 ${isLight ? 'bg-slate-100' : 'bg-black/40 border border-white/10'}`}>
                                {['auto', 'manual'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setConfig({ ...config, timerMode: m })}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 relative z-10 ${config.timerMode === m
                                            ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-white/10 text-white shadow-lg')
                                            : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/40 hover:text-white/70')
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            {config.timerMode === 'manual' && (
                                <div className="animate-fade-in-up mt-4">
                                    <StepperInput
                                        value={config.manualTime}
                                        onChange={(val) => setConfig({ ...config, manualTime: val })}
                                        theme={theme}
                                        suffix="mins"
                                        min={5}
                                        max={180}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`p-6 rounded-[2rem] border backdrop-blur-xl ${isLight ? 'bg-indigo-50/50 border-indigo-100 text-indigo-900' : 'bg-white/5 border-white/5 text-white/60'}`}>
                        <p className="text-sm font-medium leading-relaxed">
                            <span className="font-bold block mb-1">Note:</span>
                            Branding and output settings are in the main <span className="font-bold underline decoration-2">Settings</span> menu.
                        </p>
                    </div>
                </div>

                {/* Right Column: Structure */}
                <div className="lg:col-span-8">
                    <div className={`h-full p-6 md:p-8 rounded-[2rem] border backdrop-blur-xl shadow-2xl transition-all duration-500 ${isLight ? 'bg-white/80 border-slate-200/60 shadow-indigo-100/50' : 'bg-black/40 border-white/10 shadow-black/20'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Exam Structure</h2>
                                    <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{config.sections.length} Sections Defined</p>
                                </div>
                            </div>
                            <button
                                onClick={addSection}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10'}`}
                            >
                                <Plus size={16} strokeWidth={3} />
                                <span>Add Section</span>
                            </button>
                        </div>

                        <div className="space-y-4 mb-8 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            <datalist id="section-titles">
                                {[...new Set(config.sections.map(s => s.title))].map(t => <option key={t} value={t} />)}
                            </datalist>

                            {config.sections.map((section, i) => {
                                const isMcq = section.type === 'mcq';
                                const cardBorderClass = isMcq
                                    ? (isLight ? 'border-cyan-200 bg-cyan-50/50' : 'border-cyan-500/30 bg-cyan-500/5')
                                    : (isLight ? 'border-pink-200 bg-pink-50/50' : 'border-pink-500/30 bg-pink-500/5');

                                return (
                                    <div
                                        key={section.id}
                                        className={`group relative p-6 rounded-[1.5rem] border-2 transition-all duration-500 ${cardBorderClass} ${isLight
                                            ? 'hover:bg-white hover:shadow-lg'
                                            : 'hover:bg-white/10 hover:shadow-xl'
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            {/* Section Header (Left Half) */}
                                            <div className="w-full md:w-1/2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isLight ? (isMcq ? 'bg-cyan-100 text-cyan-700' : 'bg-pink-100 text-pink-700') : (isMcq ? 'bg-cyan-500/20 text-cyan-300' : 'bg-pink-500/20 text-pink-300')}`}>
                                                        {isMcq ? 'Multiple Choice' : 'Subjective / Theory'}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => duplicateSection(i)} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-indigo-50 text-slate-400 hover:text-indigo-600' : 'hover:bg-white/10 text-white/40 hover:text-white'}`} title="Duplicate">
                                                            <Copy size={14} />
                                                        </button>
                                                        {config.sections.length > 1 && (
                                                            <button onClick={() => removeSection(i)} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-red-50 text-slate-400 hover:text-red-600' : 'hover:bg-red-500/20 text-white/40 hover:text-red-400'}`} title="Remove">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="relative mt-2">
                                                    <input
                                                        type="text"
                                                        list="section-titles"
                                                        className={`w-full bg-transparent border-b-2 text-base font-bold py-2 focus:outline-none transition-colors ${isLight ? 'border-slate-300 focus:border-indigo-500 text-slate-900 placeholder-slate-400' : 'border-white/20 focus:border-fuchsia-400 text-white placeholder-white/30'}`}
                                                        value={section.title}
                                                        onChange={(e) => updateSection(i, 'title', e.target.value)}
                                                        placeholder="Section Title"
                                                    />
                                                </div>

                                                {/* Type Toggle */}
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={() => updateSection(i, 'type', 'mcq')}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${isMcq
                                                            ? (isLight ? 'bg-cyan-100 text-cyan-800 ring-2 ring-cyan-200' : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20')
                                                            : (isLight ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-white/5 text-white/40 hover:bg-white/10')
                                                            }`}
                                                    >
                                                        <AlignLeft size={14} /> MCQ
                                                    </button>
                                                    <button
                                                        onClick={() => updateSection(i, 'type', 'short')}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${!isMcq
                                                            ? (isLight ? 'bg-pink-100 text-pink-800 ring-2 ring-pink-200' : 'bg-pink-500 text-white shadow-lg shadow-pink-500/20')
                                                            : (isLight ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-white/5 text-white/40 hover:bg-white/10')
                                                            }`}
                                                    >
                                                        <FileText size={14} /> Text
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Smart Steppers (Right Half) */}
                                            <div className="w-full md:w-1/2 flex items-center gap-4 h-full pt-1">
                                                <StepperInput
                                                    label="Qty"
                                                    value={section.count}
                                                    onChange={(val) => updateSection(i, 'count', val)}
                                                    theme={theme}
                                                />
                                                <StepperInput
                                                    label="Marks"
                                                    value={section.marks}
                                                    onChange={(val) => updateSection(i, 'marks', val)}
                                                    theme={theme}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`pt-6 border-t ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                            <label className={`text-xs font-bold uppercase tracking-widest mb-4 block flex items-center gap-2 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                                <BookOpen size={14} />
                                Contextual Focus
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 'Focus on analytical questions'"
                                className={`w-full p-4 rounded-2xl border text-sm transition-all focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-400 focus:shadow-sm placeholder-slate-400' : 'bg-black/20 border-white/10 focus:bg-black/40 focus:border-white/30 text-white placeholder-white/20'}`}
                                value={config.specificTopic}
                                onChange={(e) => setConfig({ ...config, specificTopic: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Pill */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 flex justify-center pointer-events-none">
                <div className={`pointer-events-auto flex items-center gap-2 p-2 pr-2 rounded-full border backdrop-blur-2xl shadow-2xl transition-all duration-300 ${isLight ? 'bg-white/90 border-slate-200/60 shadow-indigo-500/20' : 'bg-[#121013]/90 border-white/10 shadow-black/40'}`}>

                    {/* Stats Group */}
                    <div className="flex items-center gap-4 px-4 py-2">
                        <div className="flex flex-col items-center">
                            <span className={`text-[9px] font-bold uppercase tracking-widest leading-none mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Questions</span>
                            <span className={`text-xl font-black leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalQuestions}</span>
                        </div>

                        <div className={`w-px h-8 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}></div>

                        <div className="flex flex-col items-center">
                            <span className={`text-[9px] font-bold uppercase tracking-widest leading-none mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Marks</span>
                            <span className={`text-xl font-black leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalMarks}</span>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generatePaper}
                        className={`group relative flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base transition-all duration-300 ${isLight
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40'
                            : 'bg-white text-black hover:bg-white/90 shadow-lg shadow-white/20 hover:shadow-white/30'}`}
                    >
                        <Zap size={18} className="fill-current animate-pulse-slow" />
                        <span>Generate</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenderConfig;
