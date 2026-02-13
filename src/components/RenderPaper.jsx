import React from 'react';
import { ChevronLeft, FileText, Flag, Bookmark, CheckCircle2, Clock, Calculator, Sigma, X, Plus, Minus, Divide, Equal, Info } from 'lucide-react';
import Button from './ui/Button';
import FormattedText from './ui/FormattedText';

const RenderPaper = ({
    scale, config, paper,
    paperMode, viewMode, setViewMode,
    isEditing, handleQuestionUpdate, handleOptionUpdate,
    answers, handleAnswerChange,
    textAnswers, handleTextAnswerChange,
    candidateName, mode, topicInput,
    sessionId,
    currentQuestionIndex, setCurrentQuestionIndex,
    flaggedQuestions, setFlaggedQuestions,
    timeLeft, timerActive
}) => {
    // Floating Tools state
    const [showTools, setShowTools] = React.useState(false);
    const [activeTool, setActiveTool] = React.useState(null); // 'calc' or 'math'
    const [calcDisplay, setCalcDisplay] = React.useState('0');
    const [calcExpression, setCalcExpression] = React.useState('');

    const handleCalcClick = (key) => {
        if (key === 'C' || key === 'AC') {
            setCalcDisplay('0');
            return;
        }
        if (key === '=') {
            try {
                const sanitized = calcDisplay.replace(/[^-+*/().0-9]/g, '');
                if (!sanitized) return;
                // eslint-disable-next-line no-eval
                const result = eval(sanitized);
                if (isNaN(result) || !isFinite(result)) throw new Error();
                setCalcDisplay(String(Number(result.toFixed(8))));
            } catch (e) {
                setCalcDisplay('Error');
                setTimeout(() => setCalcDisplay('0'), 1000);
            }
            return;
        }
        setCalcDisplay(prev => {
            if (prev === '0' || prev === 'Error') {
                if (typeof key === 'number' || key === '(' || key === '.') return String(key);
                return '0' + key;
            }
            return prev + key;
        });
    };

    // Animation state to trigger M3 transitions
    const [animationClass, setAnimationClass] = React.useState('animate-m3-slide-right');
    const [prevIndex, setPrevIndex] = React.useState(currentQuestionIndex);

    React.useEffect(() => {
        if (currentQuestionIndex !== prevIndex) {
            const direction = currentQuestionIndex > prevIndex ? 'animate-m3-slide-right' : 'animate-m3-slide-left';
            setAnimationClass(''); // Reset
            setTimeout(() => setAnimationClass(direction), 10);
            setPrevIndex(currentQuestionIndex);
        }
    }, [currentQuestionIndex, prevIndex]);

    const toggleFlag = (qId) => {
        setFlaggedQuestions(prev => ({
            ...prev,
            [qId]: !prev[qId]
        }));
    };
    // Flatten all questions for sequential navigation
    const allQuestions = React.useMemo(() => {
        if (!paper?.sections) return [];
        return paper.sections.flatMap(section =>
            section.questions.map(q => ({ ...q, sectionId: section.id, sectionTitle: section.title }))
        );
    }, [paper]);

    const totalQuestions = allQuestions.length;
    const currentQ = allQuestions[currentQuestionIndex];

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Group sections logic (for 'question' mode and 'model_solution' view)
    const groupedSections = {};
    paper?.sections?.forEach(section => {
        const title = section.title || "Untitled Section";
        if (!groupedSections[title]) groupedSections[title] = [];
        groupedSections[title].push(section);
    });

    const orderedGroups = [];
    const seenTitles = new Set();
    paper?.sections?.forEach(section => {
        const title = section.title || "Untitled Section";
        if (!seenTitles.has(title)) {
            seenTitles.add(title);
            orderedGroups.push({ title, sections: groupedSections[title] });
        }
    });

    const cleanOptionText = (text) => {
        return text.replace(/^[A-Da-d]\)[\s\.]*/, '').trim();
    };

    const isQuestionAttempted = (qId) => {
        return answers[qId] !== undefined || (textAnswers[qId] && textAnswers[qId].trim() !== '');
    };

    if (paperMode === 'solve' && viewMode !== 'model_solution') {
        const timerPercentage = timerActive ? (timeLeft / (config.manualTime * 60)) * 100 : 100;
        const isLowTime = timerActive && timeLeft < 300; // 5 mins

        return (
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 pb-32 min-h-[80vh] relative">
                {/* Main Question Area */}
                <div className={`flex-1 flex flex-col gap-6 transition-all duration-300 ${animationClass}`}>
                    {/* Header Info Card - Glassy Redesign */}
                    <div className="m3-glass rounded-[48px] shadow-sm p-6 flex flex-wrap justify-between items-center gap-4 text-slate-900 border border-white/40">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-50">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                    Question {currentQuestionIndex + 1}
                                </h2>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em]">
                                    {currentQ?.sectionTitle || "Assessment"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleFlag(currentQ.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm ${flaggedQuestions[currentQ.id]
                                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-200'
                                    : 'bg-slate-100/50 text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                                    }`}
                            >
                                <Flag size={18} fill={flaggedQuestions[currentQ.id] ? "currentColor" : "none"} />
                                {flaggedQuestions[currentQ.id] ? "Flagged" : "Mark for Review"}
                            </button>
                            <div className="h-10 w-[1px] bg-slate-200"></div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Marks</p>
                                <p className="text-xl font-black text-slate-900 leading-none">{currentQ?.marks || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Question Content - Unified Glassy Redesign */}
                    <div className="m3-glass rounded-[40px] shadow-2xl p-8 md:p-12 border border-white/40 flex-1 relative overflow-hidden text-slate-900">
                        <div className="prose prose-slate max-w-none mb-12">
                            <div className="text-2xl md:text-3xl font-extrabold leading-snug tracking-tight text-slate-900">
                                <FormattedText text={currentQ?.question || ""} />
                            </div>
                        </div>

                        {currentQ?.options && currentQ.options.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map((opt, oIdx) => (
                                    <label
                                        key={oIdx}
                                        className={`flex items-start gap-4 p-6 rounded-[40px] border-2 cursor-pointer transition-all duration-300 group relative overflow-hidden ${answers[currentQ.id] === opt
                                            ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                                            : 'border-slate-100 bg-white/50 hover:border-teal-200 hover:bg-white'
                                            }`}
                                    >
                                        <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${answers[currentQ.id] === opt
                                            ? 'border-teal-600 bg-teal-600 shadow-lg shadow-teal-500/20'
                                            : 'border-slate-300 group-hover:border-slate-400'
                                            }`}>
                                            {answers[currentQ.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                                        </div>
                                        <input
                                            type="radio"
                                            name={currentQ.id}
                                            value={opt}
                                            checked={answers[currentQ.id] === opt}
                                            onChange={() => handleAnswerChange(currentQ.id, opt)}
                                            className="hidden"
                                        />
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${answers[currentQ.id] === opt ? 'text-teal-700' : 'text-slate-500'}`}>
                                                Option {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span className={`text-lg transition-colors leading-tight ${answers[currentQ.id] === opt ? 'text-slate-900 font-bold' : 'text-slate-800'}`}>
                                                {cleanOptionText(opt)}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="relative group/textarea">
                                <div className="absolute -top-3 left-6 px-3 bg-white text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] z-10 transition-colors group-focus-within/textarea:text-indigo-600 border border-slate-200 rounded-full">
                                    Detailed Response
                                </div>
                                <textarea
                                    className="w-full h-64 bg-white/50 border-2 border-slate-100 rounded-[32px] p-8 text-xl font-serif focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none resize-none transition-all placeholder:text-slate-400 leading-relaxed text-slate-900"
                                    placeholder="Synthesize your answer here..."
                                    value={textAnswers[currentQ?.id] || ''}
                                    onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                                    spellCheck={false}
                                />
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation Box - Glassy Redesign */}
                    <div className="hidden md:flex justify-between items-center p-3 m3-glass rounded-[48px] shadow-2xl border border-white/30">
                        <Button
                            variant="dark"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="flex items-center gap-2 !px-8 !py-5 !rounded-full transition-all duration-300 disabled:opacity-20"
                        >
                            <ChevronLeft size={20} /> <span className="font-black tracking-wider uppercase text-[10px]">Previous</span>
                        </Button>

                        <div className="flex flex-col items-center px-8 border-x border-slate-200">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1 leading-none">Pacing</span>
                            <span className="text-slate-900 font-black text-xl tracking-tighter leading-none">{currentQuestionIndex + 1} <span className="text-slate-400">/</span> {totalQuestions}</span>
                        </div>

                        <Button
                            variant="dark"
                            disabled={currentQuestionIndex === totalQuestions - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="flex items-center gap-2 !px-12 !py-5 !rounded-full scale-105 active:scale-95 disabled:opacity-20 transition-all duration-300"
                        >
                            <span className="font-black tracking-wider uppercase text-[10px]">Next Question</span>
                            <ChevronLeft size={20} className="rotate-180" />
                        </Button>
                    </div>
                </div>

                {/* Sidebar Question Palette */}
                <div className="w-full md:w-80 flex flex-col gap-6 text-slate-900">
                    {/* Timer Widget - Glassy Redesign */}
                    {timerActive && (
                        <div className={`m3-glass rounded-[48px] p-6 shadow-xl border border-white/40 flex items-center gap-6 relative overflow-hidden group ${isLowTime ? 'timer-critical' : ''}`}>
                            <div className="relative h-20 w-20 flex-shrink-0">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle
                                        cx="40" cy="40" r="36"
                                        stroke="rgba(0,0,0,0.05)"
                                        strokeWidth="8"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="40" cy="40" r="36"
                                        stroke={isLowTime ? '#ef4444' : '#6366f1'}
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={226}
                                        strokeDashoffset={226 - (226 * (timeLeft / (config.manualTime * 60)))}
                                        strokeLinecap="round"
                                        className="timer-path"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Clock size={24} className="text-slate-400" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Time Remaining</span>
                                <span className={`text-3xl font-black tabular-nums tracking-tighter ${isLowTime ? 'text-red-600' : 'text-slate-900'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            {isLowTime && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-ping"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sidebar Question Palette - Glassy Redesign */}
                    <div className="m3-glass rounded-[48px] shadow-xl p-8 sticky top-24 border border-white/40">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Navigation</h3>
                                <p className="text-[10px] font-bold text-slate-600 uppercase mt-1">Status Overview</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-teal-600">{allQuestions.filter(q => isQuestionAttempted(q.id)).length}</span>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Solved</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {allQuestions.map((q, idx) => {
                                const isCurrent = currentQuestionIndex === idx;
                                const isAttempted = isQuestionAttempted(q.id);
                                const isFlagged = flaggedQuestions[q.id];

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`h-12 w-full rounded-3xl text-sm font-black transition-all duration-300 flex items-center justify-center relative overflow-hidden m3-ripple ${isCurrent
                                            ? 'bg-slate-900 text-white shadow-xl scale-110 z-10'
                                            : isFlagged
                                                ? 'bg-orange-100 text-orange-600 border-2 border-orange-200 shadow-sm'
                                                : isAttempted
                                                    ? 'bg-teal-50 text-teal-700 border-2 border-teal-100'
                                                    : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-teal-300 hover:text-teal-600'
                                            }`}
                                    >
                                        {idx + 1}
                                        {isFlagged && !isCurrent && (
                                            <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                                        )}
                                        {isAttempted && !isCurrent && !isFlagged && (
                                            <div className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1 p-3 bg-teal-50/50 rounded-3xl border border-teal-100">
                                <CheckCircle2 size={16} className="text-teal-600" />
                                <span className="text-[8px] font-black text-teal-700 uppercase tracking-widest leading-none">Solved</span>
                                <span className="text-lg font-black text-teal-900 leading-none">{allQuestions.filter(q => isQuestionAttempted(q.id)).length}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-orange-50/50 rounded-3xl border border-orange-100">
                                <Flag size={16} className="text-orange-500" />
                                <span className="text-[8px] font-black text-orange-700 uppercase tracking-widest leading-none">Review</span>
                                <span className="text-lg font-black text-orange-900 leading-none">{Object.values(flaggedQuestions).filter(Boolean).length}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-[24px] border border-slate-100 col-span-2 shadow-inner">
                                <div className="flex justify-between items-end">
                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Total Progress</span>
                                    <span className="text-xs font-black text-slate-900">{Math.round((allQuestions.filter(q => isQuestionAttempted(q.id)).length / totalQuestions) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1 px-[1px]">
                                    <div
                                        className="bg-teal-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(20,184,166,0.4)]"
                                        style={{ width: `${(allQuestions.filter(q => isQuestionAttempted(q.id)).length / totalQuestions) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Bar - Glassy Redesign */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[60] flex md:hidden items-center justify-between p-3 m3-glass shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[48px] border border-white/40 ring-1 ring-white/20">
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="h-14 w-14 rounded-full flex items-center justify-center bg-slate-950 !bg-none shadow-2xl border border-white/10 text-white transition-all active:scale-90 disabled:opacity-20 hover:bg-black"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <div className="flex flex-col items-center pointer-events-none px-4">
                        <div className="px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-indigo-100/50 mb-1">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">Live Assessment</span>
                        </div>
                        <span className="text-lg font-black text-slate-900 tracking-tighter">Q{currentQuestionIndex + 1} <span className="text-slate-400 mx-1">/</span> {totalQuestions}</span>
                    </div>

                    <button
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="h-14 w-14 rounded-full bg-slate-950 !bg-none text-white flex items-center justify-center transition-all active:scale-95 hover:bg-black shadow-2xl border border-white/10 disabled:opacity-20"
                    >
                        <ChevronLeft size={28} className="rotate-180" />
                    </button>
                </div>
                {/* Floating Tools Palette */}
                <div className="fixed right-8 bottom-32 z-50 flex flex-col items-end gap-3">
                    {showTools && (
                        <div className="flex flex-col gap-3 animate-fab-in mb-3">
                            <button
                                onClick={() => setActiveTool(activeTool === 'calc' ? null : 'calc')}
                                className={`h-14 w-14 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 ${activeTool === 'calc' ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600'}`}
                            >
                                <Calculator size={24} />
                            </button>
                            <button
                                onClick={() => setActiveTool(activeTool === 'math' ? null : 'math')}
                                className={`h-14 w-14 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 ${activeTool === 'math' ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-white text-slate-600 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}
                            >
                                <Sigma size={24} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowTools(!showTools)}
                        className={`h-16 w-16 rounded-[24px] bg-slate-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ${showTools ? 'rotate-45 bg-indigo-600' : ''}`}
                    >
                        {showTools ? <X size={32} /> : <Plus size={32} />}
                    </button>

                    {/* Tool Modals (Glassmorphic) - Responsive Positioning */}
                    {activeTool === 'calc' && (
                        <div className="fixed md:absolute right-4 md:right-24 bottom-32 md:bottom-0 w-[calc(100vw-32px)] md:w-80 m3-glass p-6 md:p-8 rounded-[48px] shadow-2xl border border-white/20 animate-fab-in select-none z-[70] max-h-[70vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Calculator size={16} className="text-indigo-600" /> Calculator
                                </h4>
                                <button onClick={() => setActiveTool(null)} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X size={18} className="text-slate-400 hover:text-slate-800" /></button>
                            </div>
                            <div className="bg-slate-900 rounded-3xl p-6 text-right mb-6 shadow-2xl border border-white/5">
                                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mb-1">Standard</div>
                                <div className="text-4xl font-black text-white font-mono truncate">{calcDisplay}</div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {['C', '(', ')', '/', 7, 8, 9, '*', 4, 5, 6, '-', 1, 2, 3, '+', 0, '.', '='].map((key, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleCalcClick(key)}
                                        className={`h-12 rounded-xl flex items-center justify-center font-black transition-all active:scale-95 ${typeof key === 'number' || key === '.'
                                            ? 'bg-white text-slate-800 hover:bg-slate-100 shadow-sm border border-slate-100'
                                            : key === '='
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-50 col-span-2'
                                                : key === 'C'
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                                    : 'bg-slate-50 text-indigo-600 hover:bg-indigo-100 border border-slate-100'
                                            }`}
                                    >
                                        {key === '/' ? <Divide size={16} /> : key === '*' ? <X size={16} /> : key === '-' ? <Minus size={16} /> : key === '+' ? <Plus size={16} /> : key === '=' ? <Equal size={16} /> : key}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTool === 'math' && (
                        <div className="fixed md:absolute right-4 md:right-24 bottom-32 md:bottom-0 w-[calc(100vw-32px)] md:w-80 m3-glass p-6 md:p-8 rounded-[48px] shadow-2xl border border-white/20 animate-fab-in z-[70] max-h-[70vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Sigma size={16} className="text-indigo-600" /> Symbols
                                </h4>
                                <button onClick={() => setActiveTool(null)} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X size={18} className="text-slate-400 hover:text-slate-800" /></button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {['π', 'θ', 'α', 'β', 'Σ', 'Δ', '∞', '√', '∫', '∂', '±', '≤', '≥', '≈', '≠', '∝', '^2', '√x', 'n!', 'log'].map(sym => (
                                    <button
                                        key={sym}
                                        onClick={() => {
                                            if (currentQ?.id) {
                                                const currentText = textAnswers[currentQ.id] || '';
                                                handleTextAnswerChange(currentQ.id, currentText + sym);
                                            }
                                        }}
                                        className="h-12 rounded-xl bg-white text-slate-800 font-serif text-xl border border-slate-100 hover:border-teal-500 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                                    >
                                        {sym}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase text-center">Click to insert</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default Full Paper View (for 'question' mode or editing or results)
    let globalQuestionIndex = 0;

    return (
        <>
            <div key={`paper-${paperMode}-${viewMode}`} className="w-full flex justify-center pb-20 animate-fade-in relative z-10 overflow-hidden">
                <div className="h-20 print:hidden"></div>
                <div
                    className={`shadow-2xl p-8 relative text-gray-900 w-[850px] shrink-0 print:shadow-none print:m-0 print:p-8 print:w-full print:max-w-none print:min-h-0 print:transform-none bg-white font-serif min-h-[1200px]`}
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${(1 - scale) * 1200}px` }}
                >
                    {/* Header Section */}
                    <div className="mb-8 border-b-2 border-black pb-4">
                        <div className="flex items-center justify-center mb-4">
                            {config.logoUrl && (
                                <div className="absolute left-8 top-8">
                                    <img src={config.logoUrl} alt="Logo" className="h-24 w-24 object-contain" />
                                </div>
                            )}
                            <div className="text-center">
                                <h1 className="text-5xl font-bold uppercase tracking-wide mb-2">{config.institutionName || "INSTITUTION NAME"}</h1>
                                <p className="text-xl font-bold text-gray-600 uppercase tracking-widest">Academic Session 2024-25</p>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold uppercase underline underline-offset-4 decoration-2">
                                {mode === 'topic' ? (viewMode === 'model_solution' ? "Model Solution" : "Subjective Assessment") : (viewMode === 'model_solution' ? "Model Solution" : "Terminal Examination")}
                            </h2>
                        </div>

                        <div className="flex justify-between items-center border-t-2 border-b-2 border-black py-2 mb-6">
                            <div className="font-bold text-xl"><span className="mr-2">Subject:</span> {mode === 'topic' ? topicInput : "General Knowledge"}</div>
                            <div className="font-bold text-xl"><span className="mr-2">Time Allowed:</span> {config.timerMode === 'manual' ? config.manualTime : Math.ceil(paper?.sections?.reduce((sum, s) => sum + s.questions.length * 3, 0) || 30)} Mins</div>
                            <div className="font-bold text-xl"><span className="mr-2">Total Marks:</span> {paper?.sections?.reduce((total, s) => total + s.questions.reduce((qSum, q) => qSum + q.marks, 0), 0)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xl">
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Name:</span> <div className="border-b-2 border-dotted border-gray-400 w-full text-blue-900 font-bold px-2">{candidateName}</div></div>
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Roll No:</span> <div className="border-b-2 border-dotted border-gray-400 w-full"></div></div>
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Class:</span> <div className="border-b-2 border-dotted border-gray-400 w-full"></div></div>
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Section:</span> <div className="border-b-2 border-dotted border-gray-400 w-full"></div></div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-8 print:pl-0">
                        <div className="space-y-6">
                            {orderedGroups.map((group, gIdx) => {
                                const totalMarks = group.sections.reduce((sum, sec) => sum + sec.questions.reduce((qSum, q) => qSum + q.marks, 0), 0);

                                return (
                                    <div key={group.title} className="border-2 border-black p-4">
                                        <div className="flex justify-between items-end border-b-2 border-black mb-2 pb-1">
                                            <h3 className="font-bold text-xl uppercase">Section {String.fromCharCode(65 + gIdx)}: {group.title}</h3>
                                            <span className="font-bold text-lg">Marks: {totalMarks}</span>
                                        </div>
                                        <div className="flex flex-col divide-y divide-gray-400">
                                            {group.sections.flatMap(s => ({ ...s, questions: s.questions })).flatMap(s => s.questions.map(q => ({ ...q, sectionId: s.id }))).map((q) => {
                                                globalQuestionIndex++;
                                                const isMcq = q.options && q.options.length > 0;

                                                return (
                                                    <div key={q.id} className="py-2 first:pt-0 last:pb-0 break-inside-avoid relative group/question">
                                                        <div className="flex items-baseline">
                                                            <span className="font-bold text-xl mr-2">{globalQuestionIndex}.</span>
                                                            <div className="text-xl mb-1 text-gray-900 font-bold flex-1">
                                                                {isEditing ? (
                                                                    <textarea
                                                                        className="w-full bg-yellow-50/50 border-b border-gray-300 p-2 font-mono text-sm focus:outline-none focus:border-black text-black min-h-[60px]"
                                                                        value={q.question}
                                                                        onChange={(e) => handleQuestionUpdate(q.sectionId, q.id, 'question', e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <span dangerouslySetInnerHTML={{ __html: q.question }} />
                                                                )}

                                                                {isEditing ? (
                                                                    <div className="inline-flex items-center gap-1 ml-2">
                                                                        <span className="text-sm font-normal text-gray-500">[</span>
                                                                        <input
                                                                            type="number"
                                                                            className="w-10 text-center bg-yellow-50/50 border-b border-gray-300 text-sm focus:outline-none focus:border-black"
                                                                            value={q.marks}
                                                                            onChange={(e) => handleQuestionUpdate(q.sectionId, q.id, 'marks', parseInt(e.target.value) || 0)}
                                                                        />
                                                                        <span className="text-sm font-normal text-gray-500">]</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-normal text-gray-500 ml-2">[{q.marks}]</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isMcq ? (
                                                            viewMode === 'model_solution' ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 ml-8">
                                                                    {q.options.map((opt, oIdx) => (
                                                                        <div key={oIdx} className={`text-lg p-1 rounded ${q.answer === opt ? 'bg-black text-white font-bold' : ''}`}>
                                                                            <span className="font-bold mr-2">{String.fromCharCode(97 + oIdx)})</span> {cleanOptionText(opt)} {q.answer === opt && "(Correct)"}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : paperMode === 'question' ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 ml-8">
                                                                    {q.options.map((opt, oIdx) => (
                                                                        <div key={oIdx} className="text-lg flex items-center gap-2">
                                                                            <span className="font-bold mr-2">{String.fromCharCode(97 + oIdx)})</span>
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="text"
                                                                                    className="flex-1 bg-yellow-50/50 border-b border-gray-300 text-sm focus:outline-none focus:border-black px-1"
                                                                                    value={cleanOptionText(opt)}
                                                                                    onChange={(e) => handleOptionUpdate(q.sectionId, q.id, oIdx, e.target.value)}
                                                                                />
                                                                            ) : (
                                                                                cleanOptionText(opt)
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {isEditing && (
                                                                        <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                                                                            <label className="text-xs font-bold uppercase text-gray-500 mr-2">Correct Answer:</label>
                                                                            <select
                                                                                className="bg-yellow-50/50 border border-gray-300 text-sm p-1 rounded"
                                                                                value={q.answer}
                                                                                onChange={(e) => handleQuestionUpdate(q.sectionId, q.id, 'answer', e.target.value)}
                                                                            >
                                                                                {q.options.map((opt, i) => (
                                                                                    <option key={i} value={opt}>{cleanOptionText(opt)}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2 ml-8 mt-2">
                                                                    {q.options.map((opt, oIdx) => (
                                                                        <label key={oIdx} className="flex items-center gap-4 cursor-pointer group">
                                                                            <div className={`w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center transition-all ${answers[q.id] === opt ? 'border-black bg-black' : 'group-hover:border-black'} print:border-black`}>{answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-white print:bg-black"></div>}</div>
                                                                            <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, opt)} className="hidden" />
                                                                            <span className={`text-xl text-gray-800 font-bold ${answers[q.id] === opt ? 'text-black font-extrabold' : ''}`}><span className="text-base font-bold text-gray-500 mr-3 uppercase">{String.fromCharCode(97 + oIdx)}</span> {cleanOptionText(opt)}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )
                                                        ) : (
                                                            viewMode === 'model_solution' ? (
                                                                <div className="relative w-full ml-2 mt-2 bg-gray-50 p-4 border border-gray-300 rounded font-bold text-lg">
                                                                    <span className="block font-extrabold mb-1 underline">Model Answer:</span>
                                                                    <FormattedText text={q.answerKey} />
                                                                </div>
                                                            ) : (
                                                                <div className="relative w-full ml-2 mt-2">
                                                                    {isEditing ? (
                                                                        <div className="mt-2">
                                                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Model Answer / Key Points:</label>
                                                                            <textarea
                                                                                className="w-full bg-yellow-50/50 border border-gray-300 p-2 font-mono text-sm focus:outline-none focus:border-black min-h-[80px]"
                                                                                value={q.answerKey}
                                                                                onChange={(e) => handleQuestionUpdate(q.sectionId, q.id, 'answerKey', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        paperMode === 'solve' && (
                                                                            <textarea
                                                                                className="w-full h-24 border border-gray-300 rounded-md p-3 text-lg font-serif focus:ring-1 focus:ring-black focus:border-black outline-none resize-y"
                                                                                placeholder="Type your answer here..."
                                                                                value={textAnswers[q.id] || ''}
                                                                                onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                                                                                spellCheck={false}
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    {viewMode === 'model_solution' && (
                        <div className="mt-8 flex justify-center print:hidden">
                            <Button variant="primary" onClick={() => setViewMode('summary')} className="!rounded-xl shadow-xl">
                                <ChevronLeft size={18} className="mr-2" /> Back to Results
                            </Button>
                        </div>
                    )}
                    <div className="mt-24 pt-8 border-t border-gray-300 text-center flex justify-between items-center text-base text-gray-400 print:mt-12">
                        <span>Quizify Pro Generated</span><span>CONFIDENTIAL</span>
                    </div>
                </div>
            </div>
        </>
    );
};


export default RenderPaper;
