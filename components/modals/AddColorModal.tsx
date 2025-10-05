import React, { useState, useEffect, useRef } from 'react';

interface AddColorModalProps {
  onClose: () => void;
  onAdd: (hex: string) => void;
  suggestedColors: string[];
}

const AddColorModal: React.FC<AddColorModalProps> = ({ onClose, onAdd, suggestedColors }) => {
  const [hex, setHex] = useState(suggestedColors?.[0] || '#6366F1');
  const modalRef = useRef<HTMLDivElement>(null);
  const hexInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    hexInputRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        onAdd(hex);
    } else {
        alert("Please enter a valid 6-digit hex code (e.g., #RRGGBB)");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-sm relative" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-transform active:scale-90"
          aria-label="Close modal"
          title="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 id="modal-title" className="text-2xl font-bold text-white mb-6">Add a Splash of Color</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="hex-input" className="block text-sm font-medium text-gray-300 mb-2">
              Color Code (HEX)
            </label>
            <div className="flex items-center gap-4">
               <input
                ref={hexInputRef}
                type="text"
                id="hex-input"
                value={hex}
                onChange={(e) => setHex(e.target.value.toUpperCase())}
                className="w-full bg-white/5 text-white font-mono text-lg p-3 rounded-lg border-2 border-white/20 focus:border-indigo-400 focus:ring-indigo-400 outline-none"
                placeholder="#RRGGBB"
                required
                pattern="^#[0-9A-F]{6}$"
              />
               <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value.toUpperCase())}
                className="w-12 h-12 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                style={{'--color': hex} as React.CSSProperties}
                aria-label="Color picker"
                title="Select a custom color"
               />
            </div>
          </div>
          {suggestedColors && suggestedColors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ideas from your board
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    style={{ backgroundColor: color }}
                    className="w-8 h-8 rounded-full border-2 border-white/30 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent"
                    title={color}
                    aria-label={`Select suggested color ${color}`}
                    onClick={() => setHex(color.toUpperCase())}
                    onMouseDown={e => e.stopPropagation()}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all active:scale-95" title="Cancel adding color">
              Cancel
            </button>
            <button type="submit" className="bg-indigo-500/80 hover:bg-indigo-500/100 text-white font-semibold py-2 px-6 rounded-lg transition-all active:scale-95" title="Add this color to our board">
              Add Color
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColorModal;