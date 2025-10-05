import React, { useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TextIcon } from './icons/TextIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { DnaIcon } from './icons/DnaIcon';
import { SuggestImageIcon } from './icons/SuggestImageIcon';
import { RemixIcon } from './icons/RemixIcon';
import { DoNextIcon } from './icons/DoNextIcon';
import { StyleguideIcon } from './icons/StyleguideIcon';

interface FABProps {
    isAnalyzing: boolean;
    onAddText: () => void;
    onAddColor: () => void;
    // FIX: Replaced onAnalyzeBoard with granular analysis handlers.
    onAnalyzeDna: () => void;
    onAnalyzeStyleGuide: () => void;
    onAnalyzeSuggestions: () => void;
    onAnalyzeRemixes: () => void;
    onAnalyzeDoNext: () => void;
}

const FloatingActionButton: React.FC<FABProps> = ({ 
    isAnalyzing, 
    onAddText, 
    onAddColor,
    // FIX: Destructure new granular handlers.
    onAnalyzeDna,
    onAnalyzeStyleGuide,
    onAnalyzeSuggestions,
    onAnalyzeRemixes,
    onAnalyzeDoNext,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    // FIX: Replaced single "Analyze Board" action with specific analysis actions.
    const actionButtons = [
        { icon: <UploadIcon />, label: 'Add Image', title: 'Pin an image from your computer', action: () => document.getElementById('file-input-global')?.click(), disabled: false },
        { icon: <TextIcon />, label: 'Add Note', title: 'Add a text note to the board', action: onAddText, disabled: false },
        { icon: <PaletteIcon />, label: 'Add Color', title: 'Add a color swatch to the board', action: onAddColor, disabled: false },
        { icon: <DnaIcon />, label: 'Discover DNA', title: 'Analyze the board\'s creative DNA', action: onAnalyzeDna, disabled: isAnalyzing },
        { icon: <StyleguideIcon />, label: 'Build Style Guide', title: 'Generate a style guide from the board', action: onAnalyzeStyleGuide, disabled: isAnalyzing },
        { icon: <SuggestImageIcon />, label: 'Suggest Images', title: 'Get AI-powered image suggestions', action: onAnalyzeSuggestions, disabled: isAnalyzing },
        { icon: <RemixIcon />, label: 'Spin Remixes', title: 'Generate creative remixes and variants', action: onAnalyzeRemixes, disabled: isAnalyzing },
        { icon: <DoNextIcon />, label: "Suggest What's Next", title: 'Get suggestions for what to do next', action: onAnalyzeDoNext, disabled: isAnalyzing },
    ];

    return (
        <div className="absolute bottom-8 right-8 z-30">
            <div className="relative flex flex-col items-center gap-3">
                {actionButtons.map((btn, index) => (
                    <div 
                        key={btn.label}
                        className="flex items-center gap-3 transition-all duration-300 ease-in-out"
                        style={{
                            transform: isOpen ? 'translateY(0)' : `translateY(${(actionButtons.length - index) * 20}px)`,
                            opacity: isOpen ? 1 : 0,
                            visibility: isOpen ? 'visible' : 'hidden',
                            transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                        }}
                    >
                        <span className="bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm font-semibold px-3 py-1 rounded-md shadow-lg whitespace-nowrap">
                            {isAnalyzing && btn.disabled ? 'Riffing...' : btn.label}
                        </span>
                        <button
                            onClick={btn.action}
                            disabled={btn.disabled}
                            className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 active:scale-100 disabled:from-purple-800 disabled:to-indigo-800 disabled:cursor-not-allowed"
                            aria-label={btn.title}
                            title={isAnalyzing && btn.disabled ? 'Riffing on ideas...' : btn.title}
                        >
                            {btn.icon}
                        </button>
                    </div>
                ))}

                <button
                    onClick={toggleMenu}
                    className={`bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-100 z-10 ${isOpen ? 'rotate-45' : ''}`}
                    style={{boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'}}
                    aria-expanded={isOpen}
                    aria-label="Toggle Actions Menu"
                    title="Toggle Actions Menu"
                >
                    <PlusIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default FloatingActionButton;