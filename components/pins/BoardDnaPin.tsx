import React, { useState } from 'react';
import { BoardDnaPin as BoardDnaPinType } from '../../types';
import Tag from '../shared/Tag';
import { XIcon } from '../icons/XIcon';
import TagActionPopover from '../shared/TagActionPopover';

interface BoardDnaPinProps {
  pin: BoardDnaPinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddColor: (hex: string) => void;
  onAddTag: (tag: string) => void;
  onAddTagAsTagPin: (tag: string, category: 'form' | 'material') => void;
  onGenerateFromTag: (tag: string) => void;
  isGeneratingFromTag: boolean;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

interface PopoverData {
  tag: string;
  category: 'form' | 'material';
  position: { top: number; left: number };
}

const BoardDnaPinComponent: React.FC<BoardDnaPinProps> = ({ pin, onMouseDown, onAddColor, onAddTag, onAddTagAsTagPin, onGenerateFromTag, isGeneratingFromTag, onDelete, isSelected }) => {
  const { dna } = pin;
  const ringClass = isSelected ? 'ring-4 ring-blue-400' : '';
  const zIndexClass = isSelected ? 'z-10' : '';
  
  const [popoverData, setPopoverData] = useState<PopoverData | null>(null);

  const handleTagClick = (event: React.MouseEvent<HTMLButtonElement>, tag: string, category: 'form' | 'material') => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverData({
      tag,
      category,
      position: {
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      },
    });
  };

  const handlePopoverGenerate = () => {
    if (popoverData) {
        onGenerateFromTag(popoverData.tag);
    }
    setPopoverData(null);
  };

  const handlePopoverAddNote = () => {
    if (popoverData) {
        onAddTag(popoverData.tag);
    }
    setPopoverData(null);
  };

  const handlePopoverAddTagPin = () => {
    if (popoverData) {
      onAddTagAsTagPin(popoverData.tag, popoverData.category);
    }
    setPopoverData(null);
  };


  return (
    <>
      <div
        data-pin-id={pin.id}
        className={`absolute w-[350px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing border border-white/20 transition-all ${ringClass} ${zIndexClass} hover:scale-[1.02] hover:shadow-2xl active:scale-[1.01]`}
        style={{
          left: `${pin.x}px`,
          top: `${pin.y}px`,
          boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.5)' : undefined,
        }}
        onMouseDown={onMouseDown}
      >
          <div className="p-4 relative" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                  <h3 className="text-lg font-bold text-indigo-300">Board DNA</h3>
                  <button
                      onClick={() => onDelete(pin.id)}
                      onMouseDown={e => e.stopPropagation()}
                      className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90"
                      aria-label="Close DNA card"
                      title="Close DNA card"
                  >
                      <XIcon className="w-4 h-4" />
                  </button>
              </div>
              <div className="space-y-3 text-sm pr-2 max-h-96 overflow-y-auto">
                  <div>
                      <strong className="text-gray-300 block mb-1">Palette:</strong>
                      <div className="flex flex-wrap gap-2">
                          {dna.palette.map(p => (
                              <button
                                  key={p}
                                  style={{backgroundColor: p}}
                                  className="w-6 h-6 rounded-full border-2 border-white/30 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent"
                                  title={`Pin ${p} to board`}
                                  aria-label={`Pin color ${p} to board`}
                                  onClick={() => onAddColor(p)}
                                  onMouseDown={e => e.stopPropagation()}
                              />
                          ))}
                      </div>
                  </div>
                  <div>
                      <strong className="text-gray-300 block mb-1">Forms:</strong>
                      <div className="flex flex-wrap">
                          {dna.forms.map(f => <Tag key={f} onClick={(e) => handleTagClick(e, f, 'form')} title="Interact with this tag" category="form">{f}</Tag>)}
                      </div>
                  </div>
                  <div>
                      <strong className="text-gray-300 block mb-1">Materials:</strong>
                      <div className="flex flex-wrap">
                          {dna.textures_materials.map(t => <Tag key={t} onClick={(e) => handleTagClick(e, t, 'material')} title="Interact with this tag" category="material">{t}</Tag>)}
                      </div>
                  </div>
              </div>
          </div>
      </div>
      {popoverData && (
        <TagActionPopover
          tag={popoverData.tag}
          position={popoverData.position}
          isGenerating={isGeneratingFromTag}
          onPinTag={handlePopoverAddTagPin}
          onPinAsNote={handlePopoverAddNote}
          onGenerate={handlePopoverGenerate}
          onClose={() => setPopoverData(null)}
        />
      )}
    </>
  );
};

export default BoardDnaPinComponent;