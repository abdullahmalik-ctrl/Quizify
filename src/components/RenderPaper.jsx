import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Button from './ui/Button';
import FormattedText from './ui/FormattedText';

const RenderPaper = ({
    scale, config, paper,
    paperMode, viewMode, setViewMode,
    isEditing, handleQuestionUpdate, handleOptionUpdate,
    answers, handleAnswerChange,
    textAnswers, handleTextAnswerChange,
    candidateName, mode, topicInput,
    sessionId
}) => {
    let globalQuestionIndex = 0;

    // Group sections logic
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
                                                                            <span className={`text-xl text-gray-800 font-bold ${answers[q.id] === opt ? 'text-black font-extrabold' : ''}`}><span className="text-base font-bold text-gray-500 mr-3 uppercase">{String.fromCharCode(97 + oIdx)})</span> {cleanOptionText(opt)}</span>
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
