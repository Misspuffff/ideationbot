import React, { useState, useEffect, useRef } from 'react';

interface AddTextModalProps {
  onClose: () => void;
  onAdd: (content: string, color: string) => void;
}

const NOTE_COLORS = [
    { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-400' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-400' },
    { name: 'Green', value: 'green', bg: 'bg-green-400' },
    { name: 'Pink', value: 'pink', bg: 'bg-pink-400' },
];

const AddTextModal: React.FC<AddTextModalProps> = ({ onClose, onAdd }) => {
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const modalRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
    textAreaRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(content, selectedColor.value);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md relative" 
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
        <h2 id="modal-title" className="text-2xl font-bold text-white mb-6">Jot Down an Idea</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-300 mb-2">
              Your note
            </label>
            <textarea
              ref={textAreaRef}
              id="note-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 text-white p-3 rounded-lg border-2 border-white/20 focus:border-indigo-400 focus:ring-indigo-400 outline-none"
              placeholder="Let's get this idea down..."
              required
            />
          </div>
          <div className="mb-6">
             <label className="block text-sm font-medium text-gray-300 mb-2">
              Note Color
            </label>
            <div className="flex gap-3">
                {NOTE_COLORS.map(color => (
                    <button 
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 active:scale-95 ${color.bg} ${selectedColor.name === color.name ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white' : ''}`}
                        aria-label={`Select ${color.name} color`}
                        title={`Select ${color.name} color`}
                    />
                ))}
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all active:scale-95" title="Cancel adding note">
              Cancel
            </button>
            <button type="submit" className="bg-indigo-500/80 hover:bg-indigo-500/100 text-white font-semibold py-2 px-6 rounded-lg transition-all active:scale-95" title="Add this note to our board">
              Add Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTextModal;