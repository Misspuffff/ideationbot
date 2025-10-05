
import React from 'react';
import { Pin, Link, LinkSide } from '../types';
import { XIcon } from './icons/XIcon';

interface LinkLayerProps {
  pins: Pin[];
  links: Link[];
  linkingState: { fromPinId: string; fromSide: LinkSide; endPoint: { x: number; y: number } } | null;
  onDeleteLink: (id: string) => void;
  onUpdateLink: (id: string, color: string) => void;
  transform: { x: number; y: number; scale: number };
}

// Define the color palette for links
const LINK_COLORS = ['#A78BFA', '#F472B6', '#4ADE80', '#60A5FA', '#FBBF24'];
const DEFAULT_LINK_COLOR = LINK_COLORS[0]; // The default purple

const getPinAnchorPoint = (pin: Pin, side: LinkSide): { x: number; y: number } => {
  const width = pin.width ?? 150;
  const height = pin.height ?? 150;
  
  switch (side) {
    case 'top':
      return { x: pin.x + width / 2, y: pin.y };
    case 'right':
      return { x: pin.x + width, y: pin.y + height / 2 };
    case 'bottom':
      return { x: pin.x + width / 2, y: pin.y + height };
    case 'left':
      return { x: pin.x, y: pin.y + height / 2 };
    default: // Fallback to center
      return { x: pin.x + width / 2, y: pin.y + height / 2 };
  }
};


const LinkLayer: React.FC<LinkLayerProps> = ({ pins, links, linkingState, onDeleteLink, onUpdateLink, transform }) => {
  // FIX: Explicitly type the Map to ensure correct type inference for pinMap.get().
  const pinMap: Map<string, Pin> = new Map(pins.map(p => [p.id, p]));

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            {/* Default arrowhead for new links */}
            <marker id="arrowhead-default" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={DEFAULT_LINK_COLOR} />
            </marker>
            {/* Arrowheads for each color in the palette */}
            {LINK_COLORS.map(color => (
                <marker 
                    key={color}
                    id={`arrowhead-${color.replace('#', '')}`} 
                    markerWidth="10" 
                    markerHeight="7" 
                    refX="8" 
                    refY="3.5" 
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill={color} />
                </marker>
            ))}
        </defs>
      <g style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}>
        {links.map(link => {
          const fromPin = pinMap.get(link.from);
          const toPin = pinMap.get(link.to);
          if (!fromPin || !toPin) return null;

          const p1 = getPinAnchorPoint(fromPin, link.fromSide);
          const p2 = getPinAnchorPoint(toPin, link.toSide);

          const pathData = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          
          const color = link.color || DEFAULT_LINK_COLOR;
          const markerId = `url(#arrowhead-${color.replace('#', '')})`;

          return (
            <g key={link.id} className="group transition-all" filter="url(#glow)">
              <path 
                d={pathData} 
                stroke={color}
                strokeOpacity="0.8"
                strokeWidth="2.5" 
                fill="none" 
                markerEnd={markerId}
                className="group-hover:stroke-opacity-100 group-hover:stroke-[3.5px] transition-all"
              />
              <path d={pathData} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer pointer-events-auto" />
              
              {/* Controls Wrapper: Color Palette + Delete Button */}
              <foreignObject x={midX - 60} y={midY - 16} width="120" height="32" className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity overflow-visible" style={{filter: 'none'}}>
                 <div className="flex items-center justify-center gap-1 p-1 bg-black/30 backdrop-blur-md border border-white/10 rounded-full shadow-lg" onMouseDown={e => e.stopPropagation()}>
                    {LINK_COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => onUpdateLink(link.id, c)}
                            onMouseDown={e => e.stopPropagation()}
                            className={`w-5 h-5 rounded-full transition-transform hover:scale-125 active:scale-110 focus:outline-none ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : 'ring-1 ring-white/20'}`}
                            style={{ backgroundColor: c }}
                            aria-label={`Set link color to ${c}`}
                            title={`Set link color to ${c}`}
                        />
                    ))}
                    <div className="w-px h-5 bg-white/20 mx-1"></div>
                    <button
                      onClick={() => onDeleteLink(link.id)}
                      onMouseDown={e => e.stopPropagation()}
                      className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-500 transition-transform hover:scale-110 active:scale-100"
                      aria-label="Delete link"
                      title="Delete link"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                 </div>
              </foreignObject>
            </g>
          );
        })}
        {linkingState && (() => {
          const fromPin = pinMap.get(linkingState.fromPinId);
          if (!fromPin) return null;

          const p1 = getPinAnchorPoint(fromPin, linkingState.fromSide);
          const p2 = linkingState.endPoint;
          
          const pathData = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
          return <path d={pathData} stroke={DEFAULT_LINK_COLOR} strokeWidth="3" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead-default)" />;
        })()}
      </g>
    </svg>
  );
};

export default LinkLayer;
