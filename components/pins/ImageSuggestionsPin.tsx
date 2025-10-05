
import React, { useState } from 'react';
import { ImageSuggestionsPin as ImageSuggestionsPinType, ImageSuggestion } from '../../types';
import { XIcon } from '../icons/XIcon';

interface ImageSuggestionCardProps {
  suggestion: ImageSuggestion;
  onGenerate: (prompt: string, cardId: string) => void;
  isGenerating: boolean;
}

const ImageSuggestionCard: React.FC<ImageSuggestionCardProps> = ({ suggestion, onGenerate, isGenerating }) => (
    <div className="bg-black/30 p-3 rounded-lg mb-2">
        <p className="font-mono text-xs text-gray-300 bg-black/40 p-2 rounded-md mb-2">"{suggestion.prompt}"</p>
        <button 
            onClick={() => onGenerate(suggestion.prompt, suggestion.card_id)}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded-lg text-sm transition-all duration-200 active:scale-95 disabled:bg-green-800 disabled:cursor-wait"
            title="Generate an image based on this prompt"
        >
            {isGenerating ? 'Generating...' : 'Generate & Pin'}
        </button>
    </div>
);

interface ImageSuggestionsPinProps {
  pin: ImageSuggestionsPinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onGenerateImage: (prompt: string, cardId: string) => void;
  generatingImageId: string | null;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

const ImageSuggestionsPinComponent: React.FC<ImageSuggestionsPinProps> = ({ pin, onMouseDown, onGenerateImage, generatingImageId, onDelete, isSelected }) => {
  const [concept, setConcept] = useState('');
  const ringClass = isSelected ? 'ring-4 ring-blue-400' : '';
  const zIndexClass = isSelected ? 'z-10' : '';

  const handleGenerateWithConcept = (prompt: string, cardId: string) => {
    const finalPrompt = concept.trim() ? `${concept.trim()} of ${prompt}` : prompt;
    onGenerateImage(finalPrompt, cardId);
  };

  return (
    <div
      data-pin-id={pin.id}
      className={`absolute w-[400px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing border border-white/20 transition-all ${ringClass} ${zIndexClass} hover:scale-[1.02] hover:shadow-2xl active:scale-[1.01]`}
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
        boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.5)' : undefined,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="p-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
            <h3 className="text-lg font-bold text-indigo-300">Image Suggestions</h3>
            <button
                onClick={() => onDelete(pin.id)}
                onMouseDown={e => e.stopPropagation()}
                className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90"
                aria-label="Close suggestions card"
                title="Close suggestions card"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
        
        <div className="mb-3">
          <label htmlFor={`concept-input-${pin.id}`} className="block text-sm font-medium text-gray-300 mb-1">
            Add a concept (optional)
          </label>
          <input
            id={`concept-input-${pin.id}`}
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            className="w-full bg-white/5 text-white p-2 rounded-lg border border-white/20 focus:border-indigo-400 focus:ring-indigo-400 outline-none text-sm"
            placeholder="e.g., photo of, 3D render of..."
            title="Add a subject or style to refine the generated image"
          />
        </div>

        <div className="pr-2 max-h-80 overflow-y-auto">
          {pin.suggestions.length > 0 ? (
            pin.suggestions.map(s => (
              <ImageSuggestionCard 
                key={s.card_id} 
                suggestion={s}
                onGenerate={handleGenerateWithConcept}
                isGenerating={generatingImageId === s.card_id}
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No suggestions yet. Try analyzing the board.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSuggestionsPinComponent;
