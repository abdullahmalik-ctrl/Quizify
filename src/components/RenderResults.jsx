import React from 'react';
import { Award, CheckCircle2, Edit3, X, FileText, ScanLine, FileCheck, ChevronLeft, Printer, PenTool } from 'lucide-react';
import Button from './ui/Button';
import FormattedText from './ui/FormattedText';
import Card from './ui/Card';

const RenderResults = ({
    scoreData, gradingResults, paper, answers, textAnswers, sketchAnswers,
    viewMode, setViewMode, scale, candidateName, mode, topicInput,
    setStep, config, sessionId, theme, tabSwitches
}) => {

    // We expect scoreData to be passed in, or we calculate it here. 
    // Passing it is cleaner, but calculating it here ensures consistency with view.
    // Let's recalculate to be safe since we have all data.
    const calculateDetailedScore = () => {
        let mcqScore = 0, mcqTotal = 0;
        let writtenScore = 0, writtenTotal = 0;
        const results = gradingResults?.results || {};
        paper?.sections?.forEach(section => {
            section.questions.forEach(q => {
                const isMcq = q.options && q.options.length > 0;
                if (isMcq) {
                    mcqTotal += q.marks;
                    if (results[q.id]) {
                        mcqScore += results[q.id].score;
                    } else if (answers[q.id] === q.answer) {
                        mcqScore += q.marks;
                    }
                } else {
                    writtenTotal += q.marks;
                    if (results[q.id]) writtenScore += results[q.id].score;
                }
            });
        });
        return {
            score: mcqScore + writtenScore,
            total: mcqTotal + writtenTotal,
            mcqScore, mcqTotal,
            writtenScore, writtenTotal
        };
    };

    const { score, total, mcqScore, mcqTotal, writtenScore, writtenTotal } = calculateDetailedScore();
    const percentage = Math.round((score / total) * 100) || 0;
    const results = gradingResults?.results || {};

    let globalQuestionIndex = 0;

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

    // Handlers for printing (wrapped in setTimeout to ensure render)
    const handlePrint = () => setTimeout(() => window.print(), 100);

    return viewMode === 'review' ? (
        <div className="w-full flex justify-center pb-20 animate-fade-in relative z-10 overflow-hidden">
            <div className="h-20 print:hidden"></div>
            <Card
                title=""
                theme={theme}
                variant=""
                className="w-full max-w-4xl mx-auto min-h-[80vh] bg-white text-black shadow-2xl print:shadow-none print:m-0 print:p-8 print:w-full print:max-w-none print:min-h-0 print:transform-none"
            >
                {/* Header */}
                <div className="relative border-b-4 border-double border-black pb-6 mb-12 flex justify-between items-start print:pl-0">
                    <div className="flex items-center gap-6">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="h-24 w-24 object-contain" />
                        ) : <div className="h-24 w-24 border-2 border-black flex items-center justify-center font-bold">LOGO</div>}
                        <div>
                            <h1 className="text-4xl font-black text-black uppercase tracking-wider mb-2">{config.institutionName || "INSTITUTION NAME"}</h1>
                            <div className="text-black font-bold uppercase tracking-widest border-2 border-black inline-block px-3 py-1 text-sm bg-gray-100">Official Exam Script</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-6xl font-black text-red-600 mb-1 border-4 border-red-600 rounded-full w-32 h-32 flex items-center justify-center -rotate-12 shadow-sm bg-white relative z-10">
                            <span className="flex flex-col items-center leading-none mt-2">
                                {score}
                                <span className="text-xl text-red-400 font-bold border-t-2 border-red-400 px-4 mt-1">{total}</span>
                            </span>
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-400 mt-2 tracking-widest">Final Score</span>
                        {tabSwitches > 0 && (
                            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-red-50 border-2 border-red-200 rounded-lg">
                                <ScanLine size={12} className="text-red-500" />
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">{tabSwitches} Proctoring Alert</span>
                            </div>
                        )}
                    </div>
                </div>


                {/* General Summary */}
                {gradingResults?.summary && (
                    <div className="mb-12 relative rotate-1 mx-4">
                        <div className="absolute -top-3 -left-3 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-1 transform -rotate-2 z-10 shadow-sm">Professor's Summary</div>
                        <div className="border-2 border-red-600 bg-red-50 p-6 rounded-xl relative">
                            <p className="font-handwriting text-2xl text-red-700 leading-relaxed font-bold">
                                "{gradingResults.summary}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Candidate Info Strip */}
                <div className="flex border-t-2 border-b-2 border-black py-3 mb-10 bg-gray-50 text-sm uppercase font-bold tracking-wider">
                    <div className="flex-1 border-r border-gray-300 px-4"><span className="text-gray-400 mr-2">Candidate:</span> {candidateName || "Unknown"}</div>
                    <div className="flex-1 border-r border-gray-300 px-4"><span className="text-gray-400 mr-2">Subject:</span> {mode === 'topic' ? topicInput : "General Knowledge"}</div>
                    <div className="flex-1 px-4 text-right"><span className="text-gray-400 mr-2">Date:</span> {new Date().toLocaleDateString()}</div>
                </div>

                <div className="space-y-16 print:pl-0">
                    {orderedGroups.map((group, gIdx) => {
                        const totalMarks = group.sections.reduce((sum, sec) => sum + sec.questions.reduce((qSum, q) => qSum + q.marks, 0), 0);
                        const isObjective = group.sections[0]?.type === 'mcq';

                        return (
                            <section key={group.title} className={(!isObjective && gIdx > 0) ? "break-before-page" : ""}>
                                <div className="flex items-center gap-4 mb-8 border-b-2 border-black pb-2 pt-8">
                                    <h3 className="text-2xl font-black text-black uppercase tracking-widest">Section {String.fromCharCode(65 + gIdx)}: {group.title}</h3>
                                    <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase rounded">Marks: {totalMarks}</span>
                                </div>
                                <div className="grid gap-10">
                                    {group.sections.flatMap(s => s.questions).map((q) => {
                                        globalQuestionIndex++;
                                        const isMcq = q.options && q.options.length > 0;
                                        const userAnswer = isMcq ? answers[q.id] : textAnswers[q.id];
                                        const grade = results[q.id];
                                        const isCorrect = grade ? grade.score > 0 : (isMcq ? userAnswer === q.answer : false);
                                        const isUnattempted = !userAnswer;

                                        if (isMcq) {
                                            return (
                                                <div key={q.id} className="relative pl-12 border-l-4 border-gray-200 py-1 break-inside-avoid">
                                                    <div className="absolute -left-[19px] top-0 bg-white border-2 border-gray-200 rounded-full w-9 h-9 flex items-center justify-center z-10 shadow-sm">
                                                        {isCorrect ? <span className="text-indigo-600 font-bold text-xl">✓</span> : <span className="text-red-600 font-bold text-xl">✕</span>}
                                                    </div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <p className="text-lg font-bold text-black w-4/5"><span className="mr-2 text-gray-400">{globalQuestionIndex}.</span> <span dangerouslySetInnerHTML={{ __html: q.question }} />
                                                            <span className="text-sm font-normal text-gray-500 ml-2">[{q.marks}]</span>
                                                        </p>
                                                        <span className={`font-mono font-bold text-lg ${isCorrect ? 'text-indigo-600' : 'text-red-600'}`}>
                                                            {isCorrect ? `+${q.marks}` : '0'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                        {q.options.map((opt, oIdx) => {
                                                            const isSelected = userAnswer === opt;
                                                            const isTheAnswer = q.answer === opt;
                                                            let style = "border-gray-200 text-gray-500 bg-white";
                                                            if (isSelected && isCorrect) style = "border-indigo-500 bg-emerald-50 text-indigo-900 font-bold shadow-sm ring-1 ring-emerald-200";
                                                            else if (isSelected && !isCorrect) style = "border-red-500 bg-red-50 text-red-900 line-through decoration-red-500/50 decoration-2";
                                                            else if (!isSelected && isTheAnswer) style = "border-indigo-500 bg-emerald-50 text-indigo-700 font-bold border-dashed";
                                                            return (
                                                                <div key={oIdx} className={`px-4 py-3 rounded-lg border-2 text-sm flex items-center gap-3 ${style}`}>
                                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected || isTheAnswer ? 'border-current' : 'border-gray-300'}`}>
                                                                        {(isSelected || isTheAnswer) && <div className="w-2 h-2 rounded-full bg-current"></div>}
                                                                    </div>
                                                                    {cleanOptionText(opt)}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {grade?.feedback && (
                                                        <div className="bg-red-50 border-l-4 border-red-200 p-3 text-sm text-red-800 font-medium italic relative">
                                                            {isUnattempted && <span className="absolute -top-3 right-2 bg-red-600 text-white text-[9px] uppercase px-1.5 py-0.5 font-bold rounded">Not Attempted</span>}
                                                            <span className="font-bold text-[10px] uppercase text-red-400 block mb-1 not-italic tracking-wider">Examiner Note</span>
                                                            "{grade.feedback}"
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else {
                                            const gradeData = results[q.id] || { score: 0, feedback: "Pending review...", correction: "" };
                                            return (
                                                <div key={q.id} className="relative pl-8 border-l-2 border-dashed border-gray-300 break-inside-avoid">
                                                    <div className="absolute -left-[50px] top-0 flex flex-col items-end">
                                                        <div className="w-20 h-20 rounded-full border-4 border-red-600 text-red-600 flex items-center justify-center font-handwriting text-4xl -rotate-12 bg-white shadow-lg z-10 font-bold">
                                                            {gradeData.score}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold mr-2">/ {q.marks}</span>
                                                    </div>
                                                    <div className="mb-6">
                                                        <h4 className="text-lg font-bold text-black mb-4"><span className="text-gray-400 mr-2">Q{globalQuestionIndex}.</span> <span dangerouslySetInnerHTML={{ __html: q.question }} />
                                                            <span className="text-sm font-normal text-gray-500 ml-2">[{q.marks} marks]</span>
                                                        </h4>
                                                        <div className="relative">
                                                            {isUnattempted ? (
                                                                <div className="bg-gray-100/50 p-6 rounded-xl border-2 border-dashed border-gray-300 min-h-[80px] flex items-center justify-center">
                                                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">-- No Answer Written --</span>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    <p className="font-handwriting text-2xl text-blue-900 leading-relaxed bg-blue-50 p-6 rounded-xl border border-blue-100 min-h-[100px]">
                                                                        {userAnswer}
                                                                    </p>
                                                                    {sketchAnswers && sketchAnswers[q.id] && (
                                                                        <div className="bg-white p-4 rounded-xl border border-blue-100/50 shadow-sm inline-block">
                                                                            <img src={sketchAnswers[q.id]} alt="User Sketch" className="max-h-64 rounded-lg" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-10"></div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white border-2 border-red-100 rounded-xl overflow-hidden shadow-sm">
                                                        <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center gap-2">
                                                            <PenTool size={14} className="text-red-500" />
                                                            <span className="text-xs font-black text-red-600 uppercase tracking-widest">Examiner's Review</span>
                                                            {isUnattempted && <span className="ml-auto bg-red-200 text-red-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Missing Answer</span>}
                                                        </div>
                                                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Feedback</span>
                                                                <p className="text-red-800 text-sm font-medium italic leading-relaxed">"{gradeData.feedback}"</p>
                                                            </div>
                                                            <div className="md:border-l md:border-red-100 md:pl-6">
                                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">Recommended Answer</span>
                                                                <div className="text-gray-600 text-sm leading-relaxed">
                                                                    <FormattedText text={gradeData.correction || q.answerKey} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>

                <div className="mt-20 pt-8 border-t-2 border-black flex justify-between items-end print:hidden">
                    <div>
                        <div className="text-4xl font-black text-black mb-2 font-handwriting">Quizify AI</div>
                        <div className="text-xs uppercase font-bold tracking-widest text-gray-500">Automated Assessment System</div>
                    </div>
                    <div className="text-right">
                        <div className="h-16 w-32 border-b-2 border-black mb-2"></div>
                        <div className="text-xs uppercase font-bold tracking-widest text-gray-500">Examiner Signature</div>
                    </div>
                </div>
            </Card>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 animate-fade-in-up print:hidden">
                <Button variant="dark" onClick={() => setViewMode('summary')} className="rounded-full !px-8 shadow-2xl">
                    <ChevronLeft size={20} /> Back
                </Button>
                <Button variant="primary" onClick={handlePrint} className="rounded-full !px-8 shadow-2xl">
                    <Printer size={20} /> Print Result
                </Button>
            </div>
        </div>
    ) : (
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-10 animate-fade-in-up py-6 md:py-10 relative z-10 px-4 md:px-6">
            <div className="relative inline-block">
                <div className={`absolute inset-0 ${theme === 'light' ? 'bg-indigo-500/10' : 'bg-fuchsia-500/20'} rounded-full blur-[60px]`}></div>
                <Award size={80} className={`relative z-10 ${theme === 'light' ? 'text-indigo-600' : 'text-white'} mx-auto mb-4 md:mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] md:w-[100px] md:h-[100px]`} strokeWidth={1} />
            </div>

            <div className="space-y-1 md:space-y-2 text-center">
                <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'} drop-shadow-md`}>
                    {percentage >= 80 ? "Outstanding!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
                </h2>
                <p className={`${theme === 'light' ? 'text-slate-500' : 'text-white/60'} font-light text-lg md:text-xl`}>Your assessment analysis is ready.</p>
                {tabSwitches > 0 && (
                    <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full animate-bounce">
                        <ScanLine size={16} className="text-red-500" />
                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">{tabSwitches} Unauthorized Session Exit{tabSwitches > 1 ? 's' : ''} Detected</span>
                    </div>
                )}
            </div>

            <Card
                theme={theme}
                variant="glass"
                className="relative overflow-hidden text-center"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 relative z-10 items-center">
                    <div className={`flex flex-col items-center justify-center p-6 md:p-8 border ${theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-white/5'} rounded-2xl backdrop-blur-sm shadow-inner`}>
                        <span className={`text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text ${theme === 'light' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'bg-gradient-to-r from-fuchsia-400 to-indigo-400'} drop-shadow-lg`}>{percentage}%</span>
                        <span className={`text-xs uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-white/50'} font-bold mt-2 md:mt-4`}>Total Score</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{score}</span>
                            <span className={`text-xl md:text-2xl ${theme === 'light' ? 'text-slate-300' : 'text-white/40'} font-medium`}>/ {total}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`${theme === 'light' ? 'bg-slate-50 border-slate-100 hover:bg-slate-100' : 'bg-white/5 border-white/10 hover:bg-white/10'} border rounded-2xl p-4 md:p-5 flex items-center justify-between transition-colors`}>
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="p-2 md:p-3 bg-indigo-500/20 rounded-xl text-indigo-300"><CheckCircle2 size={20} className="md:w-6 md:h-6" /></div>
                                <div className="text-left">
                                    <p className={`text-[10px] md:text-xs font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/40'} uppercase tracking-widest`}>Multiple Choice</p>
                                    <p className={`text-lg md:text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Objective </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl md:text-3xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{mcqScore}</span>
                                <span className={`text-xs md:text-sm ${theme === 'light' ? 'text-slate-300' : 'text-white/40'} font-medium`}>/{mcqTotal}</span>
                            </div>
                        </div>

                        <div className={`${theme === 'light' ? 'bg-slate-50 border-slate-100 hover:bg-slate-100' : 'bg-white/5 border-white/10 hover:bg-white/10'} border rounded-2xl p-4 md:p-5 flex items-center justify-between transition-colors`}>
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="p-2 md:p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-300"><Edit3 size={20} className="md:w-6 md:h-6" /></div>
                                <div className="text-left">
                                    <p className={`text-[10px] md:text-xs font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/40'} uppercase tracking-widest`}>Written Answers</p>
                                    <p className={`text-lg md:text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Subjective </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl md:text-3xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{writtenScore}</span>
                                <span className={`text-xs md:text-sm ${theme === 'light' ? 'text-slate-300' : 'text-white/40'} font-medium`}>/{writtenTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-4 mt-8 w-full max-w-4xl mx-auto">
                    <Button
                        onClick={() => setStep('welcome')}
                        className="flex-1 !bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 !border-none !text-white shadow-lg shadow-red-500/20 !rounded-full !h-14 !text-xs uppercase tracking-widest font-extrabold transition-all hover:scale-[1.02]"
                        variant="ghost"
                    >
                        <X size={18} /> Exit
                    </Button>

                    <Button
                        onClick={() => {
                            setViewMode('model_solution');
                        }}
                        className="flex-1 !bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-400 !border-none !text-white shadow-lg shadow-blue-500/20 !rounded-full !h-14 !text-xs uppercase tracking-widest font-extrabold transition-all hover:scale-[1.02]"
                        variant="ghost"
                    >
                        <FileText size={18} /> Solution
                    </Button>

                    <Button
                        onClick={() => {
                            setViewMode('omr_sheet');
                        }}
                        className="flex-1 !bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 !border-none !text-white shadow-lg shadow-fuchsia-500/20 !rounded-full !h-14 !text-xs uppercase tracking-widest font-extrabold transition-all hover:scale-[1.02]"
                        variant="ghost"
                    >
                        <ScanLine size={18} /> OMR
                    </Button>

                    <Button
                        onClick={() => setViewMode('review')}
                        className="flex-1 !bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 !border-none !text-white shadow-lg shadow-indigo-500/20 !rounded-full !h-14 !text-xs uppercase tracking-widest font-extrabold transition-all hover:scale-[1.02]"
                        variant="ghost"
                    >
                        <FileCheck size={18} /> Review
                    </Button>
                </div>
            </Card>

            <div className="text-center mt-8">
                <Button variant="secondary" onClick={() => window.location.reload()} className="!rounded-full border border-white/20">
                    Exit & Start New
                </Button>
            </div>
        </div>
    );
};

export default RenderResults;
