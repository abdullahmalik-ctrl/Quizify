import React from 'react';
import { ChevronLeft, FileText, Flag, Bookmark, CheckCircle2, Clock, Calculator, Sigma, X, Plus, Minus, Divide, Equal, Info, Edit3, Printer, Play } from 'lucide-react';
import Button from './ui/Button';
import FormattedText from './ui/FormattedText';
import Sketchpad from './ui/Sketchpad';



const formatTime = (seconds) => {
    if (typeof seconds !== 'number') return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const RenderPaper = ({
    scale, config, paper,
    paperMode, viewMode, setViewMode, setPaperMode,
    isEditing, setIsEditing, handleSubmitPaper, handleQuestionUpdate, handleOptionUpdate,
    answers, handleAnswerChange,
    textAnswers, handleTextAnswerChange,
    sketchAnswers, handleSketchSave,
    candidateName, mode, topicInput,
    sessionId,
    currentQuestionIndex, setCurrentQuestionIndex,
    flaggedQuestions, setFlaggedQuestions,
    timeLeft, timerActive, theme, tabSwitches
}) => {
    // Floating Tools state
    const [showTools, setShowTools] = React.useState(false);
    const [showSketchpad, setShowSketchpad] = React.useState(false);
    const [activeTool, setActiveTool] = React.useState(null); // 'calc' or 'math'
    const textareaRef = React.useRef(null);

    const [calcDisplay, setCalcDisplay] = React.useState('0');
    const [calcExpression, setCalcExpression] = React.useState('');

    const handleCalcClick = (key) => {
        if (key === 'C' || key === 'AC') {
            setCalcDisplay('0');
            return;
        }
        if (key === '←') {
            setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
            return;
        }
        if (key === '=') {
            try {
                // More advanced sanitization to allow for basic functions
                const sanitized = calcDisplay
                    .replace(/x/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/[^-+*/().0-9]/g, '');

                if (!sanitized) return;
                // eslint-disable-next-line no-eval
                const result = eval(sanitized);
                if (isNaN(result) || !isFinite(result)) throw new Error();
                setCalcDisplay(String(Number(result.toFixed(8))));
            } catch (e) {
                setCalcDisplay('Error');
                setTimeout(() => setCalcDisplay('0'), 1500);
            }
            return;
        }
        setCalcDisplay(prev => {
            if (prev === '0' || prev === 'Error') {
                if (typeof key === 'number' || key === '(' || key === '.') return String(key);
                if (key === '-' || key === '+') return '0' + key;
                return '0';
            }
            // Prevent consecutive operators
            const lastChar = prev.slice(-1);
            const operators = ['+', '-', '*', '/', '÷', 'x', '.'];
            if (operators.includes(lastChar) && operators.includes(key)) {
                return prev.slice(0, -1) + key;
            }
            return prev + key;
        });
    };

    const insertSymbol = (sym) => {
        if (!currentQ?.id) return;
        const textarea = textareaRef.current;
        const currentText = textAnswers[currentQ.id] || '';

        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = currentText.substring(0, start) + sym + currentText.substring(end);
            handleTextAnswerChange(currentQ.id, newText);

            // Re-focus and set cursor position after render
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + sym.length, start + sym.length);
            }, 10);
        } else {
            handleTextAnswerChange(currentQ.id, currentText + sym);
        }
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
            <div className={`w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 pb-32 min-h-[80vh] relative transition-colors duration-500`}>
                {showSketchpad && <Sketchpad theme={theme} onClose={() => setShowSketchpad(false)} onSave={(dataUrl) => handleSketchSave(currentQ.id, dataUrl)} />}
                {/* Main Question Area */}
                <div className={`flex-1 flex flex-col gap-6 transition-all duration-300 ${animationClass}`}>
                    {/* Header Info Card - Glassy Redesign */}
                    <div className={`${theme === 'light' ? 'bg-white/80 border-slate-200 shadow-sm' : 'm3-glass-dark border-white/40 shadow-none'} rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4 border`}>
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-50/20">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                    Question {currentQuestionIndex + 1}
                                </h2>
                                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-300'}`}>
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
                                <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Marks</p>
                                <p className={`text-xl font-black leading-none ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currentQ?.marks || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Question Content - Unified Glassy Redesign */}
                    <div className={`${theme === 'light' ? 'bg-white border-slate-200' : 'm3-glass-dark border-white/40 shadow-2xl'} rounded-2xl p-8 md:p-12 border flex-1 relative overflow-hidden`}>
                        <div className="prose prose-slate max-w-none mb-12">
                            <div className={`text-2xl md:text-3xl font-extrabold leading-snug tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                <FormattedText text={currentQ?.question || ""} />
                            </div>
                        </div>


                        {currentQ?.options && currentQ.options.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map((opt, oIdx) => (
                                    <label
                                        key={oIdx}
                                        className={`flex items-start gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group relative overflow-hidden ${answers[currentQ.id] === opt
                                            ? 'border-indigo-600 bg-indigo-600/20 shadow-lg shadow-indigo-500/10'
                                            : theme === 'light'
                                                ? 'border-slate-100 bg-white/50 hover:border-indigo-200 hover:bg-white'
                                                : 'border-white/5 bg-black/20 hover:border-white/20 hover:bg-black/40'
                                            }`}
                                    >
                                        <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${answers[currentQ.id] === opt
                                            ? 'border-indigo-500 bg-indigo-500 shadow-lg shadow-indigo-500/30'
                                            : theme === 'light'
                                                ? 'border-slate-300 group-hover:border-slate-400'
                                                : 'border-white/20 group-hover:border-white/40'
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
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${answers[currentQ.id] === opt ? 'text-indigo-400' : (theme === 'light' ? 'text-slate-500' : 'text-slate-400')}`}>
                                                Option {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span className={`text-lg transition-colors leading-tight ${answers[currentQ.id] === opt ? (theme === 'light' ? 'text-slate-900' : 'text-white') + ' font-bold' : (theme === 'light' ? 'text-slate-800' : 'text-slate-200')}`}>
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
                                    ref={textareaRef}
                                    className={`w-full h-64 border-2 rounded-2xl p-8 text-xl font-serif focus:ring-8 outline-none resize-none transition-all leading-relaxed ${theme === 'light' ? 'bg-white/50 border-slate-100 focus:ring-indigo-500/5 focus:border-indigo-500/50 text-slate-900 placeholder:text-slate-400' : 'bg-black/30 border-white/10 focus:ring-white/5 focus:border-white/30 text-white placeholder:text-white/20'}`}
                                    placeholder="Synthesize your answer here..."
                                    value={textAnswers[currentQ?.id] || ''}
                                    onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                                    spellCheck={false}
                                />
                                {sketchAnswers[currentQ.id] && (
                                    <div className="mt-4 relative group">
                                        <img src={sketchAnswers[currentQ.id]} alt="Answer Sketch" className="max-h-48 rounded-2xl border border-slate-200 bg-white" />
                                        <button onClick={() => handleSketchSave(currentQ.id, null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                    </div>
                                )}
                                <div className="mt-4 flex justify-end">
                                    <Button variant="secondary" onClick={() => setShowSketchpad(true)} className="flex items-center gap-2 !rounded-xl !py-2 !px-4 border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                                        <Edit3 size={16} /> {sketchAnswers[currentQ.id] ? "Update Sketch" : "Add Sketch / Diagram"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation Box - Glassy Redesign */}
                    <div className={`hidden md:flex justify-between items-center p-2 ${theme === 'light' ? 'bg-white/80 border-slate-200 shadow-xl' : 'm3-glass-dark border-white/30 shadow-2xl'} rounded-full border gap-4`}>

                        <Button
                            variant="dark"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="flex items-center gap-2 !px-8 !py-5 !rounded-full transition-all duration-300 disabled:opacity-20"
                        >
                            <ChevronLeft size={20} /> <span className="font-black tracking-wider uppercase text-[10px]">Previous</span>
                        </Button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPaperMode('question')}
                                className={`h-12 px-5 rounded-full flex items-center gap-2 border transition-all hover:scale-105 active:scale-95 font-bold ${theme === 'light' ? 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                                title="View Question Paper"
                            >
                                <FileText size={18} /> <span className="text-xs uppercase tracking-wider">Paper</span>
                            </button>

                            <div className={`flex flex-col items-center justify-center px-10 border-x ${theme === 'light' ? 'border-indigo-100' : 'border-white/10'}`}>
                                <div className={`text-2xl font-black tracking-widest font-mono flex items-center gap-2 mb-0.5 ${timeLeft < 60 ? 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                    timeLeft < 300 ? 'text-orange-500' :
                                        theme === 'light' ? 'text-indigo-900' : 'text-white'
                                    }`}>
                                    <Clock size={18} className={timeLeft < 300 ? 'animate-pulse' : ''} weight="bold" />
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="flex flex-col w-32 gap-1.5 mt-1">
                                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-white/10'}`}>
                                        <div
                                            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                                            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                                        />
                                    </div>
                                    <div className={`flex justify-between text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <span>Q {currentQuestionIndex + 1}</span>
                                        <span>{totalQuestions}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitPaper}
                                className={`h-12 px-5 rounded-full flex items-center gap-2 border transition-all hover:scale-105 active:scale-95 font-bold ${theme === 'light' ? 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                                title="Finish Assessment"
                            >
                                <CheckCircle2 size={18} className={theme === 'light' ? 'text-green-600' : 'text-green-400'} />
                                <span className="text-xs uppercase tracking-wider">Finish</span>
                            </button>
                        </div>

                        <Button
                            variant="dark"
                            disabled={currentQuestionIndex === totalQuestions - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="flex items-center gap-2 !px-12 !py-5 !rounded-full scale-105 active:scale-95 disabled:opacity-20 transition-all duration-300"
                        >
                            <span className="font-black tracking-wider uppercase text-[10px]">Next</span>
                            <ChevronLeft size={20} className="rotate-180" />
                        </Button>
                    </div>
                </div>

                {/* Sidebar Question Palette */}
                <div className="w-full md:w-80 flex flex-col gap-6 text-slate-900">
                    {/* Timer Widget - Glassy Redesign */}
                    {timerActive && (
                        <div className={`rounded-3xl p-6 shadow-xl border border-white/10 flex items-center gap-6 relative overflow-hidden group ${isLowTime ? 'timer-critical' : ''} ${theme === 'light' ? 'bg-white/80' : 'bg-black/20 backdrop-blur-md'}`}>
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
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Time Remaining</span>
                                <span className={`text-3xl font-black tabular-nums tracking-tighter ${isLowTime ? 'text-red-600' : (theme === 'light' ? 'text-slate-900' : 'text-white')}`}>
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
                    <div className={`rounded-3xl shadow-xl p-8 sticky top-24 border border-white/10 ${theme === 'light' ? 'bg-white/80' : 'bg-black/20 backdrop-blur-md'}`}>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                            <div>
                                <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Navigation</h3>
                                <p className={`text-[10px] font-bold uppercase mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Status Overview</p>
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
                                            ? 'bg-indigo-600 text-white shadow-xl scale-110 z-10'
                                            : isFlagged
                                                ? 'bg-orange-100 text-orange-600 border-2 border-orange-200 shadow-sm'
                                                : isAttempted
                                                    ? theme === 'light'
                                                        ? 'bg-green-100 text-green-700 border-2 border-green-200'
                                                        : 'bg-green-600 text-white border-2 border-green-500 shadow-lg shadow-green-900/30'
                                                    : theme === 'light'
                                                        ? 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-teal-300 hover:text-teal-600'
                                                        : 'bg-slate-800/60 text-slate-300 border border-white/5 hover:border-white/20 hover:bg-slate-700/80'
                                            }`}
                                    >
                                        {idx + 1}
                                        {isFlagged && !isCurrent && (
                                            <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                                        )}
                                        {isAttempted && !isCurrent && !isFlagged && (
                                            <div className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ${theme === 'light' ? 'bg-green-500' : 'bg-white'}`}></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-3">
                            <div className={`flex flex-col gap-1 p-3 rounded-3xl border ${theme === 'light' ? 'bg-green-50/50 border-green-100' : 'bg-green-500/10 border-green-500/20'}`}>
                                <CheckCircle2 size={16} className={theme === 'light' ? 'text-green-600' : 'text-green-400'} />
                                <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${theme === 'light' ? 'text-green-700' : 'text-green-200'}`}>Solved</span>
                                <span className={`text-lg font-black leading-none ${theme === 'light' ? 'text-green-900' : 'text-white'}`}>{allQuestions.filter(q => isQuestionAttempted(q.id)).length}</span>
                            </div>
                            <div className={`flex flex-col gap-1 p-3 rounded-3xl border ${theme === 'light' ? 'bg-orange-50/50 border-orange-100' : 'bg-orange-500/10 border-orange-500/20'}`}>
                                <Flag size={16} className={theme === 'light' ? 'text-orange-500' : 'text-orange-400'} />
                                <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${theme === 'light' ? 'text-orange-700' : 'text-orange-200'}`}>Review</span>
                                <span className={`text-lg font-black leading-none ${theme === 'light' ? 'text-orange-900' : 'text-white'}`}>{Object.values(flaggedQuestions).filter(Boolean).length}</span>
                            </div>
                            <div className={`flex flex-col gap-1 p-4 rounded-xl border col-span-2 shadow-inner ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5'}`}>
                                <div className="flex justify-between items-end">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>Total Progress</span>
                                    <span className={`text-xs font-black ${theme === 'light' ? 'text-slate-900' : 'text-slate-300'}`}>{Math.round((allQuestions.filter(q => isQuestionAttempted(q.id)).length / totalQuestions) * 100)}%</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden mt-1 px-[1px] ${theme === 'light' ? 'bg-slate-200' : 'bg-white/10'}`}>
                                    <div
                                        className="bg-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                        style={{ width: `${(allQuestions.filter(q => isQuestionAttempted(q.id)).length / totalQuestions) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Mobile Navigation Bar - Glassy Redesign with integrated actions */}
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[98%] max-w-[420px] z-[60] flex md:hidden items-center justify-between p-2 ${theme === 'light' ? 'bg-white/90 backdrop-blur-xl' : 'm3-glass-dark'} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-full border border-white/40 ring-1 ring-white/20`}>
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-slate-950 !bg-none shadow-xl border border-white/10 text-white transition-all active:scale-90 disabled:opacity-20 hover:bg-black"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1 justify-center flex-1 mx-1">
                        {/* Question Paper Button */}
                        <button
                            onClick={() => setPaperMode('question')}
                            className={`h-9 px-2 rounded-full flex items-center justify-center gap-1 transition-all active:scale-95 border border-white/10 ${theme === 'light' ? 'bg-white text-slate-600' : 'bg-white/10 text-white'}`}
                        >
                            <FileText size={14} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Paper</span>
                        </button>

                        <div className="flex flex-col items-center justify-center px-2 border-x border-white/10 mx-0.5">
                            <div className={`text-sm font-black tracking-widest font-mono flex items-center gap-1 leading-none mb-0.5 ${timeLeft < 60 ? 'text-red-500 animate-pulse' :
                                timeLeft < 300 ? 'text-orange-500' :
                                    theme === 'light' ? 'text-indigo-900' : 'text-white'
                                }`}>
                                <Clock size={10} strokeWidth={3} />
                                {formatTime(timeLeft)}
                            </div>
                            <div className={`text-[8px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                Q {currentQuestionIndex + 1} <span className="text-slate-300 dark:text-slate-600">/</span> {totalQuestions}
                            </div>
                        </div>

                        {/* Finish Button */}
                        <button
                            onClick={handleSubmitPaper}
                            className={`h-9 px-2 rounded-full flex items-center justify-center gap-1 transition-all active:scale-95 border border-white/10 ${theme === 'light' ? 'bg-white text-slate-600' : 'bg-white/10 text-white'}`}
                        >
                            <CheckCircle2 size={14} className={theme === 'light' ? 'text-green-600' : 'text-green-400'} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Finish</span>
                        </button>
                    </div>

                    <button
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl disabled:opacity-20 ${theme === 'light' ? 'bg-slate-950 text-white hover:bg-black' : 'bg-black text-white hover:bg-slate-900 border border-white/10'}`}
                    >
                        <ChevronLeft size={20} className="rotate-180" />
                    </button>
                </div>

                {/* Floating Tools Palette */}
                <div className="fixed right-8 bottom-32 z-50 flex flex-col items-end gap-3">
                    {showTools && (
                        <div className="flex flex-col gap-3 animate-fab-in mb-3">
                            <button
                                onClick={() => setShowSketchpad(true)}
                                title="Live Sketchpad"
                                className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${theme === 'light' ? 'bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600' : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600'}`}
                            >
                                <Edit3 size={24} />
                            </button>
                            <button
                                onClick={() => setActiveTool(activeTool === 'calc' ? null : 'calc')}
                                className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${activeTool === 'calc' ? 'bg-indigo-600 text-white shadow-indigo-500/40' : theme === 'light' ? 'bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600' : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600'}`}
                            >
                                <Calculator size={24} />
                            </button>
                            <button
                                onClick={() => setActiveTool(activeTool === 'math' ? null : 'math')}
                                className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${activeTool === 'math' ? 'bg-indigo-600 text-white shadow-indigo-500/40' : theme === 'light' ? 'bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600' : 'bg-white text-slate-600 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}
                            >
                                <Sigma size={24} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setShowTools(!showTools)}
                        className={`h-16 w-16 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ${showTools ? 'rotate-45 bg-indigo-600' : ''}`}
                    >
                        {showTools ? <X size={32} /> : <Plus size={32} />}
                    </button>

                    {/* Tool Modals (Glassmorphic) - Responsive Positioning */}
                    {activeTool === 'calc' && (
                        <div className="fixed md:absolute right-4 md:right-24 bottom-32 md:bottom-0 w-[calc(100vw-32px)] md:w-80 m3-glass p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20 animate-fab-in select-none z-[70] max-h-[70vh] overflow-y-auto">
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
                                {['C', '←', '(', ')', 7, 8, 9, '÷', 4, 5, 6, 'x', 1, 2, 3, '-', 0, '.', '+', '='].map((key, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleCalcClick(key)}
                                        className={`h-12 rounded-full flex items-center justify-center font-black transition-all active:scale-95 ${typeof key === 'number' || key === '.'
                                            ? 'bg-white text-slate-800 hover:bg-slate-100 shadow-sm border border-slate-100'
                                            : key === '='
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-50'
                                                : key === 'C' || key === '←'
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                                    : 'bg-slate-50 text-indigo-600 hover:bg-indigo-100 border border-slate-100'
                                            }`}
                                    >
                                        {key === '÷' ? <Divide size={16} /> : key === 'x' ? <X size={16} /> : key === '-' ? <Minus size={16} /> : key === '+' ? <Plus size={16} /> : key === '=' ? <Equal size={16} /> : key}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTool === 'math' && (
                        <div className="fixed md:absolute right-4 md:right-24 bottom-32 md:bottom-0 w-[calc(100vw-32px)] md:w-80 m3-glass p-6 md:p-8 rounded-3xl shadow-2xl border border-white/20 animate-fab-in z-[70] max-h-[70vh] overflow-y-auto">
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
                                        onClick={() => insertSymbol(sym)}
                                        className="h-12 rounded-full bg-white text-slate-800 font-serif text-xl border border-slate-100 hover:border-teal-500 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center shadow-sm"
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
                    className="shadow-2xl p-8 relative shrink-0 print:shadow-none print:m-0 print:p-8 print:w-full print:max-w-none print:min-h-0 print:transform-none font-serif min-h-[1200px] transition-all duration-500 w-[850px] bg-white text-gray-900 border border-gray-300"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${(1 - scale) * 1200}px` }}
                >
                    {/* Header Section */}
                    <div className="mb-8 border-b-2 pb-4 border-black">
                        <div className="flex items-center justify-center mb-4">
                            {config.logoUrl && (
                                <div className="absolute left-8 top-8">
                                    <img src={config.logoUrl} alt="Logo" className="h-24 w-24 object-contain" />
                                </div>
                            )}
                            <div className="text-center">
                                <h1 className="text-5xl font-bold uppercase tracking-wide mb-2">{config.institutionName || "INSTITUTION NAME"}</h1>
                                <p className="text-xl font-bold uppercase tracking-widest text-gray-600">Academic Session 2024-25</p>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold uppercase underline underline-offset-4 decoration-2">
                                {mode === 'topic' ? (viewMode === 'model_solution' ? null : "Subjective Assessment") : (viewMode === 'model_solution' ? null : "Terminal Examination")}
                            </h2>
                        </div>

                        <div className="flex justify-between items-center border-t-2 border-b-2 py-2 mb-6 border-black">
                            <div className="font-bold text-xl"><span className="mr-2">Subject:</span> {mode === 'topic' ? topicInput : "General Knowledge"}</div>
                            <div className="font-bold text-xl"><span className="mr-2">Time Allowed:</span> {config.timerMode === 'manual' ? config.manualTime : Math.ceil(paper?.sections?.reduce((sum, s) => sum + s.questions.length * 3, 0) || 30)} Mins</div>
                            <div className="font-bold text-xl"><span className="mr-2">Total Marks:</span> {paper?.sections?.reduce((total, s) => total + s.questions.reduce((qSum, q) => qSum + q.marks, 0), 0)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xl">
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Name:</span> <div className="border-b-2 border-dotted w-full font-bold px-2 border-gray-400 text-blue-900">{candidateName}</div></div>
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Roll No:</span> <div className="border-b-2 border-dotted w-full border-gray-400"></div></div>
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Class:</span> <div className="border-b-2 border-dotted w-full border-gray-400"></div></div>
                            <div className="flex items-end"><span className="font-bold mr-2 whitespace-nowrap">Section:</span> <div className="border-b-2 border-dotted w-full border-gray-400"></div></div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-8 print:pl-0">
                        <div className="space-y-6">
                            {orderedGroups.map((group, gIdx) => {
                                const totalMarks = group.sections.reduce((sum, sec) => sum + sec.questions.reduce((qSum, q) => qSum + q.marks, 0), 0);

                                return (
                                    <div key={group.title} className="border-2 p-4 border-black">
                                        <div className="flex justify-between items-end border-b-2 mb-2 pb-1 border-black">
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
                                                            <div className="text-xl mb-1 font-bold flex-1 text-gray-900">
                                                                {isEditing ? (
                                                                    <textarea
                                                                        className="w-full bg-white border-b border-black p-2 font-mono text-sm focus:outline-none focus:border-blue-600 text-black min-h-[60px]"
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
                                                                            className="w-10 text-center bg-white border-b border-gray-300 text-sm focus:outline-none focus:border-black"
                                                                            value={q.marks}
                                                                            onChange={(e) => handleQuestionUpdate(q.sectionId, q.id, 'marks', parseInt(e.target.value) || 0)}
                                                                        />
                                                                        <span className="text-sm font-normal text-gray-500">]</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-normal ml-2 text-gray-500">[{q.marks}]</span>
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
                                                                                    className="flex-1 bg-white border-b border-gray-300 text-sm focus:outline-none focus:border-black px-1"
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
                                                                                className="bg-white border border-gray-300 text-sm p-1 rounded"
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
                                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answers[q.id] === opt ? 'border-black bg-black' : 'border-gray-600'} print:border-black`}>{answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-white print:bg-black"></div>}</div>
                                                                            <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => handleAnswerChange(q.id, opt)} className="hidden" />
                                                                            <span className={`text-xl font-bold ${answers[q.id] === opt ? 'text-black font-extrabold' : 'text-gray-800'}`}><span className="text-base font-bold mr-3 uppercase text-gray-500">{String.fromCharCode(97 + oIdx)}</span> {cleanOptionText(opt)}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )
                                                        ) : (
                                                            viewMode === 'model_solution' ? (
                                                                <div className="relative w-full ml-2 mt-2 p-4 border rounded font-bold text-lg bg-white border-black">
                                                                    <span className="block font-extrabold mb-1 underline">Model Answer:</span>
                                                                    <FormattedText text={q.answerKey} />
                                                                </div>
                                                            ) : (
                                                                // Question Paper Mode: Just the question, no answer space
                                                                null
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

                    <div className="mt-24 pt-8 border-t border-gray-300 text-center flex justify-between items-center text-base text-gray-400 print:mt-12">
                        <span>Quizify Pro Generated</span><span>CONFIDENTIAL</span>
                    </div>
                </div>
            </div>
            {viewMode === 'model_solution' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 print:hidden">
                    <div className="flex items-center gap-2 p-2 rounded-full border border-white/20 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-black/40 animate-fade-in-up transition-all hover:scale-105 ring-1 ring-white/10">
                        <button
                            onClick={() => window.print()}
                            className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 shadow-lg border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center"
                            title="Print Solution"
                        >
                            <Printer size={20} />
                            <span className="ml-2 text-xs font-bold uppercase tracking-widest px-2">Print Solution</span>
                        </button>
                    </div>
                </div>
            )}
            {viewMode !== 'model_solution' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 print:hidden">
                    <div className="flex items-center gap-2 p-2 rounded-full border border-white/20 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-black/40 animate-fade-in-up transition-all hover:scale-105 ring-1 ring-white/10">
                        {/* Edit Button */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-md ${isEditing
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-black/60 text-white hover:bg-black/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 shadow-lg border border-white/10'
                                }`}
                            title={isEditing ? "Save Changes" : "Edit Paper"}
                        >
                            {isEditing ? <CheckCircle2 size={20} /> : <Edit3 size={20} />}
                        </button>

                        <div className="w-[1px] h-6 bg-slate-900/10 dark:bg-white/10 mx-1"></div>

                        {/* Print Button */}
                        <button
                            onClick={() => window.print()}
                            className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 shadow-lg border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center"
                            title="Print Paper"
                        >
                            <Printer size={20} />
                        </button>

                        <div className="w-[1px] h-6 bg-slate-900/10 dark:bg-white/10 mx-1"></div>

                        {/* Solve Button */}
                        <button
                            onClick={() => {
                                setPaperMode('solve');
                                setCurrentQuestionIndex(0);
                            }}
                            className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 shadow-lg border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center"
                            title="Start Solving"
                        >
                            <Play size={20} fill="currentColor" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};


export default RenderPaper;
