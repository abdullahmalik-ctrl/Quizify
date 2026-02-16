import React, { useState, useEffect, useRef } from 'react';
import { Settings, Clock, CheckCircle, Brain, Edit3, FileText, Printer, ChevronLeft, ScanLine, Palette, Sun, Moon, Monitor, AlertCircle } from 'lucide-react';
import { generateWithGemini, gradeWithGemini } from './utils/gemini';
import Button from './components/ui/Button';
import RenderWelcome from './components/RenderWelcome';
import RenderInput from './components/RenderInput';
import RenderConfig from './components/RenderConfig';
import RenderLoading, { RenderGrading } from './components/RenderLoading';
import RenderPaper from './components/RenderPaper';
import RenderOMR from './components/RenderOMR';
import RenderResults from './components/RenderResults';
import RenderSettings from './components/RenderSettings';



export default function Quizify() {
    const [step, setStep] = useState('welcome');
    const [prevStep, setPrevStep] = useState('welcome');
    const [mode, setMode] = useState(null);
    const [rawText, setRawText] = useState('');
    const [topicInput, setTopicInput] = useState('');

    // Settings State
    const [candidateName, setCandidateName] = useState('');
    const [vibeCheck, setVibeCheck] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // AI State
    const [userApiKey, setUserApiKey] = useState(localStorage.getItem('quizify_api_key') || '');
    const [aiModel, setAiModel] = useState(localStorage.getItem('quizify_ai_model') || 'models/gemini-1.5-flash');
    const [profiles, setProfiles] = useState([]);
    const [profileName, setProfileName] = useState('');

    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [viewMode, setViewMode] = useState('summary');
    const [paperMode, setPaperMode] = useState('question');
    const [gradingResults, setGradingResults] = useState({ results: {}, summary: '' });
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
    const [paper, setPaper] = useState(null);
    const [answers, setAnswers] = useState({});
    const [textAnswers, setTextAnswers] = useState({});
    const [sketchAnswers, setSketchAnswers] = useState({});
    const [sessionId] = useState(Math.floor(Math.random() * 10000));
    const [scale, setScale] = useState(1);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [flaggedQuestions, setFlaggedQuestions] = useState({});
    const [tabSwitches, setTabSwitches] = useState(0);
    const [theme, setTheme] = useState(localStorage.getItem('quizify_theme') || 'system');


    const [config, setConfig] = useState({
        sections: [
            { id: 'sec_1', type: 'mcq', title: 'Multiple Choice', count: 5, marks: 1 },
            { id: 'sec_2', type: 'short', title: 'Short Answer', count: 3, marks: 5 },
            { id: 'sec_3', type: 'long', title: 'Long Questions', count: 1, marks: 10 }
        ],
        specificTopic: '',
        difficulty: 'medium',
        timerMode: 'auto',
        manualTime: 30,
        institutionName: '',
        logoUrl: ''
    });

    const topRef = useRef(null);

    // History Navigation Helper
    const changeStep = (newStep, replace = false, newViewMode = null) => {
        const state = { step: newStep, viewMode: newViewMode };
        const hash = newViewMode ? `#${newStep}/${newViewMode}` : `#${newStep}`;

        if (replace) {
            window.history.replaceState(state, '', hash);
        } else {
            window.history.pushState(state, '', hash);
        }
        setStep(newStep);
        if (newViewMode) setViewMode(newViewMode);
    };

    const handleViewModeChange = (newMode) => {
        // When changing view mode within results, we push a new history entry
        // keeping the current step ('results')
        const state = { step: step, viewMode: newMode };
        window.history.pushState(state, '', `#${step}/${newMode}`);
        setViewMode(newMode);
    };

    // Handle Browser Back Button
    useEffect(() => {
        // Initial state replacement to ensure we have a state to pop back to
        window.history.replaceState({ step: 'welcome' }, '', '#welcome');

        const handlePopState = (event) => {
            if (event.state) {
                if (event.state.step) setStep(event.state.step);
                // If viewMode is in state, set it. Otherwise default to 'summary' if we are in results
                // This ensures popping back from 'review' (which has viewMode) to 'results' (which might not)
                // resets the view.
                if (event.state.viewMode) {
                    setViewMode(event.state.viewMode);
                } else if (event.state.step === 'results') {
                    setViewMode('summary');
                }
            } else {
                // Fallback if no state exists
                setStep('welcome');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Load profiles from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('quizify_profiles');
        if (saved) {
            try { setProfiles(JSON.parse(saved)); } catch (e) { console.error("Failed to load profiles", e); }
        }
    }, []);

    // MathJax injection logic
    useEffect(() => {
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
            },
            svg: { fontCache: 'global' },
            startup: { typeset: false }
        };

        const scriptId = 'mathjax-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // Trigger typeset
    useEffect(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            setTimeout(() => {
                window.MathJax.typesetPromise().catch((err) => console.log('MathJax typeset error:', err));
            }, 150);
        }
    }, [step, viewMode, paper, paperMode, isEditing]);

    useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [step]);



    // Theme Management
    useEffect(() => {
        const root = window.document.documentElement;
        const applyTheme = (t) => {
            root.classList.remove('light', 'dark');
            if (t === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(t);
            }
        };

        applyTheme(theme);
        localStorage.setItem('quizify_theme', theme);

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    // Proctoring: Tab Switch Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && step === 'paper' && paperMode === 'solve') {
                setTabSwitches(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [step, paperMode]);

    // Scaling logic

    useEffect(() => {
        const handleResize = () => {
            const PAPER_WIDTH = 850;
            const padding = 32;
            const windowWidth = window.innerWidth;
            if (windowWidth < PAPER_WIDTH + padding * 2) {
                setScale((windowWidth - padding) / PAPER_WIDTH);
            } else {
                setScale(1);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let interval = null;
        const isSolving = step === 'paper' && paperMode === 'solve';

        if (timerActive && timeLeft > 0 && isSolving) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
        }

        return () => clearInterval(interval);
    }, [timerActive, timeLeft, step, paperMode]);

    // Loading animation message rotation
    useEffect(() => {
        if (step === 'loading' || step === 'grading') {
            // Only if component needs it, but here we pass loadingMsgIndex to RenderLoading
            // Actually RenderLoading handles its own index?
            // The original code handled it in App. Let's keep it here.
            // Wait, RenderLoading in the original code TOOK `loadingMsgIndex` as prop.
            // I'll re-add the interval here to drive it.
            const interval = setInterval(() => setLoadingMsgIndex(prev => prev + 1), 2500); // Simple increment, component can modulo
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleStart = (selectedMode) => {
        setMode(selectedMode);
        changeStep('input');
        setRawText('');
        setTopicInput('');
        setPaper(null);
        setError(null);
        setAnswers({});
        setTextAnswers({});
        setPaperMode('question');
        setIsEditing(false);
    };

    const openSettings = () => {
        if (step !== 'settings') {
            setPrevStep(step);
            changeStep('settings');
            setError(null);
        }
    };

    const closeSettings = () => {
        changeStep(prevStep);
    };

    const handleTextSubmit = () => { changeStep('config'); };

    const handleAnswerChange = (qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleTextAnswerChange = (qId, val) => {
        setTextAnswers(prev => ({ ...prev, [qId]: val }));
    }

    const handleSketchSave = (qId, dataUrl) => {
        setSketchAnswers(prev => ({ ...prev, [qId]: dataUrl }));
    }

    const handlePrint = () => { window.print(); };

    // Paper Edit Handlers
    const handleQuestionUpdate = (sectionId, questionId, field, value) => {
        setPaper(prev => {
            const newSections = prev.sections.map(sec => {
                if (sec.id !== sectionId) return sec;
                return {
                    ...sec,
                    questions: sec.questions.map(q => {
                        if (q.id !== questionId) return q;
                        return { ...q, [field]: value };
                    })
                };
            });
            return { ...prev, sections: newSections };
        });
    };

    const handleOptionUpdate = (sectionId, questionId, optIndex, value) => {
        setPaper(prev => {
            const newSections = prev.sections.map(sec => {
                if (sec.id !== sectionId) return sec;
                return {
                    ...sec,
                    questions: sec.questions.map(q => {
                        if (q.id !== questionId) return q;
                        const newOptions = [...q.options];
                        newOptions[optIndex] = value;
                        return { ...q, options: newOptions };
                    })
                };
            });
            return { ...prev, sections: newSections };
        });
    };

    const generatePaper = async () => {
        changeStep('loading'); setError(null);
        let content = mode === 'topic' ? topicInput : rawText;
        if (!content.trim()) { setError("Input data required."); changeStep('config'); return; }
        try {
            const generated = await generateWithGemini(content, config, mode, userApiKey, aiModel);

            let totalQuestions = 0;
            generated.sections.forEach(s => totalQuestions += s.questions.length);

            let duration = config.timerMode === 'manual' ? config.manualTime * 60 : Math.ceil(totalQuestions * 3) * 60;

            setTimeLeft(duration); setTimerActive(true); setPaper(generated); setPaperMode('question'); changeStep('paper', true); setIsEditing(false);
        } catch (err) { setError("Generation failed: " + err.message); changeStep('config'); }
    };

    const handleSubmitPaper = async () => {
        changeStep('grading');
        try {
            const graded = await gradeWithGemini(paper, textAnswers, answers, vibeCheck, userApiKey, aiModel);
            setGradingResults(graded);
            // Reset view mode to summary when entering results
            changeStep('results', true, 'summary');
        } catch (e) {
            console.error(e);
            changeStep('results', true, 'summary');
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className={`min-h-screen font-sans selection:bg-fuchsia-500/30 selection:text-white relative overflow-x-hidden transition-colors duration-500 ${theme === 'light' ? 'text-slate-900' : 'text-gray-100'}`} ref={topRef}>
            <div className="fixed inset-0 z-0 pointer-events-none print:hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,19,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[60] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-10"></div>

                {/* Removed masking gradient so body gradient shows through */}

                {theme === 'dark' ? (
                    <>
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 rounded-full blur-[120px]"></div>
                        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[100px]"></div>
                    </>
                ) : (
                    <>
                        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px]"></div>
                    </>
                )}
                <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] ${theme === 'light' ? 'opacity-[0.03]' : 'opacity-100'}`}></div>
            </div>

            <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 print:hidden">
                <div className={`absolute inset-0 backdrop-blur-md border-b transition-colors duration-500 ${theme === 'light' ? 'bg-white/70 border-slate-200' : 'bg-white/5 border-white/10'}`}></div>
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative">
                    <div className="flex items-center gap-2 md:gap-4 cursor-pointer group" onClick={() => setStep('welcome')}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-fuchsia-600 blur-lg opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
                            <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-fuchsia-500/20 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Brain size={18} className="text-white drop-shadow-md md:w-[22px] md:h-[22px]" />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className={`font-black text-lg md:text-xl tracking-tighter transition-all duration-300 ${theme === 'light' ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-100 to-fuchsia-300'}`}>QUIZIFY</span>
                            <span className={`text-[8px] md:text-[9px] font-bold tracking-[0.3em] uppercase leading-none transition-all duration-300 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>AI PRO MAX</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6">

                        <button
                            onClick={openSettings}
                            className="p-2 rounded-xl transition-all duration-300 border bg-black/50 border-white/10 text-white/60 hover:text-white hover:bg-black/70 backdrop-blur-md"
                            title="Settings & Profiles"
                        >
                            <Settings size={20} />
                        </button>




                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 pt-32 relative z-10 print:p-0 print:max-w-none">
                {step === 'welcome' && <RenderWelcome handleStart={handleStart} theme={theme} />}
                {step === 'input' && <RenderInput
                    mode={mode} setStep={changeStep}
                    rawText={rawText} setRawText={setRawText}
                    topicInput={topicInput} setTopicInput={setTopicInput}
                    handleTextSubmit={handleTextSubmit}
                    theme={theme}
                />}
                {step === 'config' && <RenderConfig
                    config={config} setConfig={setConfig}
                    setStep={changeStep} generatePaper={generatePaper}
                    error={error} theme={theme}
                    mode={mode} topicInput={topicInput} rawText={rawText}
                />}
                {step === 'loading' && <RenderLoading loadingMsgIndex={loadingMsgIndex} theme={theme} />}
                {step === 'grading' && <RenderLoading isGrading loadingMsgIndex={loadingMsgIndex} theme={theme} />}
                {(step === 'paper' || (step === 'results' && viewMode === 'model_solution')) && <RenderPaper
                    scale={scale} config={config} paper={paper}
                    paperMode={paperMode} viewMode={viewMode} setViewMode={handleViewModeChange}
                    isEditing={isEditing} handleQuestionUpdate={handleQuestionUpdate} handleOptionUpdate={handleOptionUpdate}
                    answers={answers} handleAnswerChange={handleAnswerChange}
                    textAnswers={textAnswers} handleTextAnswerChange={handleTextAnswerChange}
                    sketchAnswers={sketchAnswers} handleSketchSave={handleSketchSave}
                    candidateName={candidateName} mode={mode} topicInput={topicInput} sessionId={sessionId}
                    currentQuestionIndex={currentQuestionIndex} setCurrentQuestionIndex={setCurrentQuestionIndex}
                    flaggedQuestions={flaggedQuestions} setFlaggedQuestions={setFlaggedQuestions}
                    timeLeft={timeLeft} timerActive={timerActive} theme={theme} tabSwitches={tabSwitches}
                    setPaperMode={setPaperMode} setIsEditing={setIsEditing} handleSubmitPaper={handleSubmitPaper}
                />}
                {step === 'results' && viewMode === 'omr_sheet' && <RenderOMR
                    scale={scale} paper={paper} config={config}
                    sessionId={sessionId} mode={mode} topicInput={topicInput}
                    candidateName={candidateName} theme={theme}
                />}
                {step === 'results' && (viewMode === 'summary' || viewMode === 'review') && <RenderResults
                    gradingResults={gradingResults} paper={paper}
                    answers={answers} textAnswers={textAnswers}
                    sketchAnswers={sketchAnswers}
                    viewMode={viewMode} setViewMode={handleViewModeChange}
                    scale={scale} candidateName={candidateName}
                    mode={mode} topicInput={topicInput}
                    setStep={changeStep} config={config} sessionId={sessionId}
                    theme={theme} tabSwitches={tabSwitches}
                />}
                {step === 'settings' &&
                    <RenderSettings
                        closeSettings={closeSettings}
                        config={config} setConfig={setConfig}
                        candidateName={candidateName} setCandidateName={setCandidateName}
                        vibeCheck={vibeCheck} setVibeCheck={setVibeCheck}
                        profiles={profiles} setProfiles={setProfiles}
                        profileName={profileName} setProfileName={setProfileName}
                        userApiKey={userApiKey} setUserApiKey={setUserApiKey}
                        aiModel={aiModel} setAiModel={setAiModel}
                        theme={theme} setTheme={setTheme}
                    />
                }
            </main>

        </div>
    );
}
