import React from 'react';

const FormattedText = ({ text, className = '' }) => {
    if (text === undefined || text === null) return null;

    let content = "";
    if (typeof text !== 'string') {
        if (Array.isArray(text)) {
            content = text.join('\n');
        } else if (typeof text === 'object') {
            content = JSON.stringify(text); // Last resort for objects
        } else {
            content = String(text);
        }
    } else {
        content = text;
    }

    // Helper to process inline styles (bold)
    const renderInline = (str) => {
        return str.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="font-bold">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {content.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-1"></div>;

                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    return (
                        <div key={i} className="flex items-start gap-2 pl-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-current rounded-full shrink-0 opacity-70"></div>
                            <div className="flex-1">{renderInline(trimmed.substring(2))}</div>
                        </div>
                    );
                }

                return <div key={i}>{renderInline(line)}</div>;
            })}
        </div>
    );
};

export default FormattedText;
