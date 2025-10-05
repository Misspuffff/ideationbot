
import React from 'react';
import { RemixesPin as RemixesPinType } from '../../types';
import Tag from '../shared/Tag';
import { XIcon } from '../icons/XIcon';

interface RemixesPinProps {
  pin: RemixesPinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onAddTag: (tag: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

const RemixesPinComponent: React.FC<RemixesPinProps> = ({ pin, onMouseDown, onAddTag, onDelete, isSelected }) => {
  const ringClass = isSelected ? 'ring-4 ring-blue-400' : '';
  const zIndexClass = isSelected ? 'z-10' : '';
  
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
            <h3 className="text-lg font-bold text-indigo-300">Remixes & Variants</h3>
            <button
                onClick={() => onDelete(pin.id)}
                onMouseDown={e => e.stopPropagation()}
                className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90"
                aria-label="Close remixes card"
                title="Close remixes card"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="pr-2 max-h-96 overflow-y-auto space-y-3">
          {pin.remixes.length > 0 ? (
            pin.remixes.map(r => (
              <div key={r.name} className="bg-black/30 p-3 rounded-lg text-sm">
                <h5 className="font-semibold text-white">{r.name}</h5>
                <p className="text-gray-400 mb-1 text-xs">Lever: <Tag onClick={() => onAddTag(r.lever)} title="Pin as note" category="lever">{r.lever}</Tag></p>
                <ul className="list-disc list-inside text-gray-300 mt-2">
                  {r.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No remixes spun up yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemixesPinComponent;
