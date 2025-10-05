
import React from 'react';
import { ColorPin, LinkSide, ResizeCorner } from '../../types';
import { XIcon } from '../icons/XIcon';
import ResizeHandle from '../shared/ResizeHandle';
import LinkHandle from '../shared/LinkHandle';

interface ColorPinProps {
  pin: ColorPin;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  onResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, corner: ResizeCorner) => void;
  onStartLinking: (e: React.MouseEvent<HTMLDivElement>, side: LinkSide) => void;
  isDragging?: boolean;
  isResizing?: boolean;
  isSelected?: boolean;
}

const ColorPinComponent: React.FC<ColorPinProps> = ({ pin, onMouseDown, onDelete, onResizeMouseDown, onStartLinking, isDragging, isResizing, isSelected }) => {
  const ringClass = isSelected 
    ? 'ring-4 ring-blue-400' 
    : isResizing ? 'ring-2 ring-indigo-500' : '';
  const zIndexClass = isDragging || isResizing || isSelected ? 'z-10' : '';

  return (
    <div
      data-pin-id={pin.id}
      className={`absolute rounded-2xl shadow-lg cursor-grab active:cursor-grabbing flex flex-col justify-end p-3 text-white font-mono text-center group transition-all duration-200 border border-white/10 backdrop-blur-sm
        ${ringClass} ${zIndexClass}
        ${isDragging ? 'scale-115 shadow-2xl' : 'hover:scale-105 active:scale-[1.02]'}
      `}
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
        width: `${pin.width}px`,
        height: `${pin.height}px`,
        backgroundColor: pin.hex,
        boxShadow: isSelected 
            ? '0 0 20px rgba(59, 130, 246, 0.5), 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
      }}
      onMouseDown={onMouseDown}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30 rounded-2xl mix-blend-multiply" />
      <span className="relative bg-black/30 px-2 py-1 rounded">{pin.hex}</span>
      <button
        onClick={() => onDelete(pin.id)}
        onMouseDown={e => e.stopPropagation()}
        className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 active:bg-red-400 active:scale-95"
        aria-label="Delete swatch"
        title="Delete swatch"
      >
        <XIcon className="w-4 h-4" />
      </button>
      <ResizeHandle position="top-left" onMouseDown={(e) => onResizeMouseDown(e, 'top-left')} />
      <ResizeHandle position="top-right" onMouseDown={(e) => onResizeMouseDown(e, 'top-right')} />
      <ResizeHandle position="bottom-left" onMouseDown={(e) => onResizeMouseDown(e, 'bottom-left')} />
      <ResizeHandle position="bottom-right" onMouseDown={(e) => onResizeMouseDown(e, 'bottom-right')} />
      <LinkHandle position="top" onMouseDown={(e) => onStartLinking(e, 'top')} />
      <LinkHandle position="right" onMouseDown={(e) => onStartLinking(e, 'right')} />
      <LinkHandle position="bottom" onMouseDown={(e) => onStartLinking(e, 'bottom')} />
      <LinkHandle position="left" onMouseDown={(e) => onStartLinking(e, 'left')} />
    </div>
  );
};

export default ColorPinComponent;
