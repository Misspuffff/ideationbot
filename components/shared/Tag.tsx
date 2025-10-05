
import React from 'react';

interface TagProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    title?: string;
    category?: 'form' | 'material' | 'lever' | 'default';
}

const Tag: React.FC<TagProps> = ({ children, onClick, className = '', title, category = 'default' }) => {
    const categoryStyles = {
        default: {
            base: "bg-white/10 border-white/10 text-indigo-300",
            hover: "hover:bg-indigo-500/50 hover:text-white",
            focus: "focus:ring-indigo-400"
        },
        form: {
            base: "bg-teal-900/50 border-teal-500/30 text-teal-300",
            hover: "hover:bg-teal-500/50 hover:text-white",
            focus: "focus:ring-teal-400"
        },
        material: {
            base: "bg-amber-900/50 border-amber-500/30 text-amber-300",
            hover: "hover:bg-amber-500/50 hover:text-white",
            focus: "focus:ring-amber-400"
        },
        lever: {
            base: "bg-rose-900/50 border-rose-500/30 text-rose-300",
            hover: "hover:bg-rose-500/50 hover:text-white",
            focus: "focus:ring-rose-400"
        }
    };

    const styles = categoryStyles[category] || categoryStyles.default;
    
    const baseClasses = `text-xs font-medium mr-2 mb-1 px-2.5 py-0.5 rounded-full inline-block border backdrop-blur-sm ${styles.base}`;

    if (onClick) {
        return (
            <button
                onClick={onClick}
                onMouseDown={e => e.stopPropagation()} // Prevent parent drag
                className={`${baseClasses} transition-all ${styles.hover} active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${styles.focus} ${className}`}
                title={title}
            >
                {children}
            </button>
        );
    }

    return (
        <span className={`${baseClasses} ${className}`}>
            {children}
        </span>
    );
};

export default Tag;
