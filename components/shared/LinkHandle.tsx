
import React from 'react';
import { LinkIcon } from '../icons/LinkIcon';
import { LinkSide } from '../../types';

interface LinkHandleProps {
  position: LinkSide;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const positionClasses: Record<LinkSide, string> = {
    top: '-top-3 left-1/2 -translate-x-1/2',
    right: '-right-3 top-1/2 -translate-y-1/2',
    bottom: '-bottom-3 left-1/2 -translate-x-1/2',
    left: '-left-3 top-1/2 -translate-y-1/2',
};

const LinkHandle: React.FC<LinkHandleProps> = ({ position, onMouseDown }) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute w-6 h-6 bg-indigo-500 border-2 border-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center justify-center hover:scale-110 active:scale-100 ${positionClasses[position]}`}
      style={{ touchAction: 'none' }}
      aria-label={`Create link from ${position}`}
      title="Drag to link pins"
    >
        <LinkIcon className="w-4 h-4 text-white" />
    </div>
  );
};

export default LinkHandle;
