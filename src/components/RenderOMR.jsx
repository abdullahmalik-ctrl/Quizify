import React from 'react';

const RenderOMR = ({ scale, paper, config, sessionId, mode, topicInput, candidateName }) => {
    // Collect all MCQs from all sections
    const allMcqs = paper?.sections?.flatMap(s => s.questions.filter(q => q.options && q.options.length > 0)) || [];
    const totalQuestions = allMcqs.length || 20;
    const questionsPerCol = Math.ceil(totalQuestions / 2);

    const getColumnQuestions = (colIndex) => {
        const start = colIndex * questionsPerCol;
        return allMcqs.slice(start, start + questionsPerCol);
    };

    return (
        <div className="w-full flex justify-center pb-20 animate-fade-in relative z-10 overflow-hidden">
            <div className="h-20 print:hidden"></div>
            <div
                className="bg-white font-sans min-h-[1100px] shadow-2xl p-8 relative text-gray-900 w-[850px] shrink-0 print:shadow-none print:m-0 print:p-8 print:w-full print:max-w-none print:min-h-0 print:transform-none"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${(1 - scale) * 1100}px` }}
            >
                <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-black"></div>
                <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-black"></div>
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-black"></div>
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-black"></div>

                <div className="absolute top-8 right-20 flex flex-col items-center">
                    <div className="flex items-end gap-0.5 h-12">
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className={`w-${Math.random() > 0.5 ? '1' : '0.5'} h-full bg-black`}></div>
                        ))}
                    </div>
                    <span className="text-[10px] font-mono tracking-widest mt-1">QZ-{sessionId}-OMR</span>
                </div>

                <div className="max-w-[780px] mx-auto mt-4">
                    <div className="flex items-start gap-6 mb-8 border-b-2 border-black pb-6">
                        <div className="h-20 w-20 border-2 border-black flex items-center justify-center bg-gray-50">
                            {config.logoUrl ? <img src={config.logoUrl} className="max-h-full max-w-full" alt="Logo" /> : <div className="text-center text-[10px] font-bold">LOGO</div>}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-1">OMR ANSWER SHEET</h1>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">{config.institutionName || "QUIZIFY PRO ASSESSMENT"}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">Read instructions carefully before filling the form</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold uppercase">{mode === 'topic' ? topicInput : "General Knowledge"}</div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Exam Series 2024</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8 mb-8">
                        <div className="col-span-5 space-y-6">
                            <div className="border-2 border-black p-4">
                                <h3 className="font-bold uppercase text-sm mb-3 border-b border-black pb-1">Marking Instructions</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-black border border-black mb-1"></div>
                                            <span className="text-[10px] uppercase font-bold">Correct</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center mb-1"><span className="text-lg font-bold">&times;</span></div>
                                            <span className="text-[10px] uppercase font-bold text-gray-500">Wrong</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center mb-1 relative overflow-hidden"><div className="absolute inset-0 bg-black rotate-45 w-1/2"></div></div>
                                            <span className="text-[10px] uppercase font-bold text-gray-500">Wrong</span>
                                        </div>
                                    </div>
                                    <ul className="text-[10px] list-disc pl-3 leading-tight space-y-1 text-gray-700 font-medium">
                                        <li>Use <span className="font-bold text-black">Blue/Black</span> Ball Point Pen only.</li>
                                        <li>Darken the circles completely.</li>
                                        <li>Darken only one circle for each question.</li>
                                        <li>No stray marks on the sheet.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="border-2 border-black p-4">
                                <h3 className="font-bold uppercase text-sm mb-3 border-b border-black pb-1">Roll Number</h3>
                                <div className="flex justify-center gap-2">
                                    {[...Array(6)].map((_, col) => (
                                        <div key={col} className="flex flex-col gap-1 items-center">
                                            <div className="w-8 h-10 border border-black mb-1"></div>
                                            {[...Array(10)].map((_, row) => (
                                                <div key={row} className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-[8px] text-gray-400 hover:border-black hover:text-black">
                                                    {row}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-7 space-y-6">
                            <div className="border-2 border-black p-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Candidate Name (In Block Letters)</label>
                                        <div className="border border-black h-10 w-full flex items-center px-3 font-mono font-bold uppercase">{candidateName}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Date of Exam</label>
                                            <div className="border border-black h-10 w-full flex items-center px-3 font-mono font-bold uppercase"></div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Center Code</label>
                                            <div className="border border-black h-10 w-full flex items-center px-3 font-mono font-bold uppercase"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-2 border-black p-1">
                                <div className="bg-black text-white text-center py-1 font-bold uppercase text-xs mb-4">Answers</div>
                                <div className="flex gap-4 px-2">
                                    <div className="flex-1 space-y-3">
                                        {getColumnQuestions(0).map((q, idx) => (
                                            <div key={q.id} className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-sm w-6 text-right">{idx + 1}</span>
                                                <div className="flex gap-2">
                                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                                        <div key={opt} className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-[10px] font-bold hover:bg-black hover:text-white transition-colors">
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-px bg-black/20 my-2"></div>
                                    <div className="flex-1 space-y-3">
                                        {getColumnQuestions(1).map((q, idx) => (
                                            <div key={q.id} className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-sm w-6 text-right">{idx + 1 + questionsPerCol}</span>
                                                <div className="flex gap-2">
                                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                                        <div key={opt} className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-[10px] font-bold hover:bg-black hover:text-white transition-colors">
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-4"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-4 pt-4 border-t-2 border-black">
                        <div className="text-center w-64">
                            <div className="border-b border-black mb-1 h-8"></div>
                            <span className="text-[10px] font-bold uppercase text-gray-600">Signature of Candidate</span>
                        </div>
                        <div className="text-center w-64">
                            <div className="border-b border-black mb-1 h-8"></div>
                            <span className="text-[10px] font-bold uppercase text-gray-600">Signature of Invigilator</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-2 w-full text-center text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                    DO NOT FOLD OR STAPLE • COMPUTER GENERATED FORM • {sessionId}
                </div>
            </div>
        </div>
    )
};

export default RenderOMR;
