
import React from 'react';
import { ResizeCorner } from '../../types';

interface ResizeHandleProps {
  position: ResizeCorner;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const positionClasses: Record<ResizeCorner, string> = {
    'top-left': '-top-2 -left-2 cursor-nwse-resize',
    'top-right': '-top-2 -right-2 cursor-nesw-resize',
    'bottom-left': '-bottom-2 -left-2 cursor-nesw-resize',
    'bottom-right': '-bottom-2 -right-2 cursor-nwse-resize',
};

const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onMouseDown }) => {
  return (
    <div
      data-resize-handle="true"
      onMouseDown={onMouseDown}
      className={`absolute w-5 h-5 bg-indigo-500 border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 ${positionClasses[position]} active:scale-90 active:bg-indigo-400`}
      style={{ touchAction: 'none' }}
      aria-label={`Resize pin from ${position}`}
      title={`Resize pin from ${position}`}
    />
  );
};

export default ResizeHandle;
