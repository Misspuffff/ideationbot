import React, { useState, useEffect } from 'react';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';

interface HeaderProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onUndo, onRedo, canUndo, canRedo
}) => {
  const [modifierSymbol, setModifierSymbol] = useState('Ctrl');
  const [redoShortcut, setRedoShortcut] = useState('Ctrl+Y');

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setModifierSymbol(isMac ? '⌘' : 'Ctrl');
    setRedoShortcut(isMac ? '⌘+Shift+Z' : 'Ctrl+Y');
  }, []);

  return (
    <header className="p-4 sm:p-6 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-white">
            FlowBoard
            <span className="text-sm font-normal text-gray-300 ml-2">Your creative buddy</span>
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={onUndo} 
                disabled={!canUndo}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition-all disabled:text-gray-600 disabled:cursor-not-allowed text-gray-300 hover:bg-white/10 hover:text-white active:scale-95"
                aria-label={`Undo (${modifierSymbol}+Z)`}
                title={`Undo (${modifierSymbol}+Z)`}
            >
                <UndoIcon className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold hidden sm:inline">Undo</span>
            </button>
            <button 
                onClick={onRedo} 
                disabled={!canRedo}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition-all disabled:text-gray-600 disabled:cursor-not-allowed text-gray-300 hover:bg-white/10 hover:text-white active:scale-95"
                aria-label={`Redo (${redoShortcut})`}
                title={`Redo (${redoShortcut})`}
            >
                <span className="font-semibold hidden sm:inline">Redo</span>
                <RedoIcon className="w-5 h-5" aria-hidden="true" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;