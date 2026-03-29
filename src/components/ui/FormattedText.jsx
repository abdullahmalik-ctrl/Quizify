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

    // Normalize common AI-style math like $x^{n+1}/(n+1)$ into proper fraction form.
    const normalizeMathBlocks = (input) => {
        return input.replace(/\$([^$]+)\$/g, (_full, expr) => {
            let normalized = expr.trim();

            // Convert numerator/(denominator) when numerator has no top-level slash.
            const fracMatch = normalized.match(/^(.+?)\s*\/\s*\((.+)\)$/);
            if (fracMatch && !fracMatch[1].includes('/')) {
                normalized = `\\frac{${fracMatch[1].trim()}}{${fracMatch[2].trim()}}`;
            }

            return `$${normalized}$`;
        });
    };

    content = normalizeMathBlocks(content);

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
