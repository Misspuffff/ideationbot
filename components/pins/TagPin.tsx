
import React from 'react';
import { TagPin, LinkSide } from '../../types';
import { XIcon } from '../icons/XIcon';
import LinkHandle from '../shared/LinkHandle';
import Tag from '../shared/Tag';

interface TagPinProps {
  pin: TagPin;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  onStartLinking: (e: React.MouseEvent<HTMLDivElement>, side: LinkSide) => void;
  isDragging?: boolean;
  isSelected?: boolean;
}

const TagPinComponent: React.FC<TagPinProps> = ({ pin, onMouseDown, onDelete, onStartLinking, isDragging, isSelected }) => {
  const ringClass = isSelected 
    ? 'ring-4 ring-blue-400' 
    : '';
  const zIndexClass = isDragging || isSelected ? 'z-10' : '';

  return (
    <div
      data-pin-id={pin.id}
      className={`absolute cursor-grab active:cursor-grabbing group transition-all duration-200 ${zIndexClass} ${isDragging ? 'scale-115 shadow-2xl' : 'hover:scale-105 active:scale-[1.02]'}`}
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
      }}
      onMouseDown={onMouseDown}
    >
      <div 
        className={`relative ${ringClass} rounded-full`}
        style={{
          boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.5)' : undefined,
        }}
      >
        <Tag category={pin.category} className="text-base px-4 py-2 pointer-events-none">
            {pin.content}
        </Tag>
        <button
            onClick={() => onDelete(pin.id)}
            onMouseDown={e => e.stopPropagation()}
            className="absolute -top-1 -right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 active:bg-red-400 active:scale-95"
            aria-label="Delete tag"
            title="Delete tag"
        >
            <XIcon className="w-3 h-3" />
        </button>
        {/* Link handles appear on hover of the main div */}
        <LinkHandle position="top" onMouseDown={(e) => onStartLinking(e, 'top')} />
        <LinkHandle position="right" onMouseDown={(e) => onStartLinking(e, 'right')} />
        <LinkHandle position="bottom" onMouseDown={(e) => onStartLinking(e, 'bottom')} />
        <LinkHandle position="left" onMouseDown={(e) => onStartLinking(e, 'left')} />
      </div>
    </div>
  );
};

export default TagPinComponent;
