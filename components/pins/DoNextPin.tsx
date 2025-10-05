
import React from 'react';
import { DoNextPin as DoNextPinType } from '../../types';
import { XIcon } from '../icons/XIcon';

interface DoNextPinProps {
  pin: DoNextPinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

const DoNextPinComponent: React.FC<DoNextPinProps> = ({ pin, onMouseDown, onDelete, isSelected }) => {
  const ringClass = isSelected ? 'ring-4 ring-blue-400' : '';
  const zIndexClass = isSelected ? 'z-10' : '';
  
  return (
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
      <div className="p-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
            <h3 className="text-lg font-bold text-indigo-300">Do Next</h3>
            <button
                onClick={() => onDelete(pin.id)}
                onMouseDown={e => e.stopPropagation()}
                className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90"
                aria-label="Close next steps card"
                title="Close next steps card"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="pr-2 max-h-96 overflow-y-auto">
          {pin.doNext.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-200 bg-black/30 p-3 rounded-lg space-y-2">
              {pin.doNext.map((task, i) => <li key={i}>{task}</li>)}
            </ul>
          ) : (
             <p className="text-gray-400 text-sm">No next steps queued.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoNextPinComponent;
