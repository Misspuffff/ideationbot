import React, { useState, useEffect, useRef } from 'react';
import { Background } from '../types';

interface SettingsPopoverProps {
  setBackground: (bg: Background) => void;
  currentBackground: Background;
  onClose: () => void;
}

const PRESET_COLORS = ['transparent', '#111827', '#1F2937', '#0C4A6E', '#164E63', '#4C1D95'];

const SettingsPopover: React.FC<SettingsPopoverProps> = ({ setBackground, currentBackground, onClose }) => {
  const [imageUrl, setImageUrl] = useState(currentBackground.type === 'image' ? currentBackground.value : '');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      setBackground({ type: 'image', value: imageUrl });
    }
  };

  const handleReset = () => {
    setBackground({ type: 'color', value: 'transparent' }); // Default color
    setImageUrl('');
  };

  return (
    <div 
        ref={popoverRef}
        className="absolute top-full right-0 mt-2 w-72 bg-black/30 backdrop-blur-2xl border border-white/10 rounded-lg shadow-2xl z-50 p-4"
        onMouseDown={e => e.stopPropagation()}
    >
        <h3 className="text-lg font-semibold text-white mb-4">Customize Board</h3>
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Color
            </label>
            <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        style={{ backgroundColor: color === 'transparent' ? '#333' : color }}
                        className={`w-7 h-7 rounded-full border-2 border-white/30 cursor-pointer transition-transform hover:scale-110 focus:outline-none 
                            ${currentBackground.type === 'color' && currentBackground.value === color 
                                ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-transparent' 
                                : ''}`
                        }
                        title={color}
                        onClick={() => setBackground({ type: 'color', value: color })}
                    />
                ))}
            </div>
        </div>
        
        <div className="mb-4">
             <label htmlFor="bg-image-url" className="block text-sm font-medium text-gray-300 mb-2">
                Background Image URL
            </label>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                    id="bg-image-url"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white/5 text-white text-sm p-2 rounded-md border border-white/20 focus:border-indigo-400 focus:ring-indigo-400 outline-none"
                    placeholder="https://..."
                />
                <button type="submit" className="bg-indigo-500/80 hover:bg-indigo-500/100 text-white font-semibold px-3 rounded-md text-sm">Set</button>
            </form>
        </div>

        <button 
            onClick={handleReset}
            className="w-full text-center text-sm text-gray-400 hover:text-white py-2 rounded-md hover:bg-white/10 transition-colors"
        >
            Reset to Default
        </button>
    </div>
  );
};

export default SettingsPopover;