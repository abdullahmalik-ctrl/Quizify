import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Eraser, Pen, Download, X } from 'lucide-react';

const Sketchpad = ({ onClose, onSave, theme }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'

    useEffect(() => {
        const canvas = canvasRef.current;
        const scale = window.devicePixelRatio || 1;

        // Use a fixed logical size for consistency when "saving"
        const logicalWidth = canvas.offsetWidth;
        const logicalHeight = canvas.offsetHeight;

        canvas.width = logicalWidth * scale;
        canvas.height = logicalHeight * scale;

        const context = canvas.getContext('2d');
        context.scale(scale, scale);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = theme === 'light' ? '#0f172a' : '#f8fafc';
        context.lineWidth = 2;
        contextRef.current = context;

        // Background
        context.fillStyle = theme === 'light' ? '#ffffff' : '#0f172a';
        context.fillRect(0, 0, logicalWidth, logicalHeight);
    }, [theme]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        if (!isDrawing) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;

        if (tool === 'eraser') {
            contextRef.current.strokeStyle = theme === 'light' ? '#ffffff' : '#0f172a';
            contextRef.current.lineWidth = 20;
        } else {
            contextRef.current.strokeStyle = theme === 'light' ? '#0f172a' : '#f8fafc';
            contextRef.current.lineWidth = 2;
        }

        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.fillStyle = theme === 'light' ? '#ffffff' : '#0f172a';
        // Fill based on logical size since context is scaled
        context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        if (onSave) onSave(dataUrl);
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-sm bg-black/40">
            <div className={`w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border transition-colors duration-500 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/10'}`}>
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between ${theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-black/20'}`}>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <Pen size={20} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-black uppercase tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Math Sketchpad</h3>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Live Sketchpad & Diagrams</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg active:scale-95`}
                        >
                            <Download size={16} /> ADD TO PAPER
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                        <button
                            onClick={clear}
                            className={`p-2.5 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-red-50 text-slate-400 hover:text-red-500' : 'hover:bg-red-500/10 text-white/30 hover:text-red-400'}`}
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2.5 rounded-xl transition-all ${theme === 'light' ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-900' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative cursor-crosshair">
                    <canvas
                        onMouseDown={startDrawing}
                        onMouseUp={finishDrawing}
                        onMouseOut={finishDrawing}
                        onMouseMove={draw}
                        ref={canvasRef}
                        className="w-full h-full touch-none"
                    />
                </div>

                {/* Toolbar */}
                <div className={`p-6 border-t flex items-center justify-center gap-4 ${theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-black/20'}`}>
                    <div className={`flex p-1.5 rounded-2xl gap-1 ${theme === 'light' ? 'bg-white shadow-sm border border-slate-200' : 'bg-black/40 border border-white/10'}`}>
                        <button
                            onClick={() => setTool('pen')}
                            className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all ${tool === 'pen' ? 'bg-indigo-600 text-white shadow-lg' : theme === 'light' ? 'text-slate-400 hover:text-slate-900' : 'text-white/40 hover:text-white'}`}
                        >
                            <Pen size={18} /> <span className="text-xs font-black uppercase">Pen</span>
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all ${tool === 'eraser' ? 'bg-indigo-600 text-white shadow-lg' : theme === 'light' ? 'text-slate-400 hover:text-slate-900' : 'text-white/40 hover:text-white'}`}
                        >
                            <Eraser size={18} /> <span className="text-xs font-black uppercase">Eraser</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sketchpad;
