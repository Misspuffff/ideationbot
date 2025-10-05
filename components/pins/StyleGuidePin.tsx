
import React, { useEffect } from 'react';
import { StyleGuidePin as StyleGuidePinType } from '../../types';
import { XIcon } from '../icons/XIcon';

interface StyleGuidePinProps {
  pin: StyleGuidePinType;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (id: string) => void;
  onAddTag: (tag: string) => void;
  isSelected?: boolean;
}

const parseTypographyDetails = (details: string): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  const parts = details.split(',').map(s => s.trim().toLowerCase());
  
  const weightMap: { [key: string]: number } = {
    'thin': 100, 'extralight': 200, 'light': 300,
    'normal': 400, 'regular': 400, 'medium': 500,
    'semibold': 600, 'bold': 700, 'extrabold': 800, 'black': 900
  };
  
  parts.forEach(part => {
    if (part.endsWith('px')) {
      styles.fontSize = part;
    } else if (weightMap[part]) {
      styles.fontWeight = weightMap[part];
    }
  });

  return styles;
};


const StyleGuidePinComponent: React.FC<StyleGuidePinProps> = ({ pin, onMouseDown, onDelete, onAddTag, isSelected }) => {
  const { styleGuide } = pin;
  const ringClass = isSelected ? 'ring-4 ring-blue-400' : '';
  const zIndexClass = isSelected ? 'z-10' : '';

  useEffect(() => {
    if (styleGuide.typography.font_family) {
      const fontFamily = styleGuide.typography.font_family;
      const fontName = fontFamily.split(',')[0].trim().replace(/"/g, '');

      const weightMap: { [key: string]: number } = {
        'thin': 100, 'extralight': 200, 'light': 300,
        'normal': 400, 'regular': 400, 'medium': 500,
        'semibold': 600, 'bold': 700, 'extrabold': 800, 'black': 900
      };

      const weights = new Set<number>();
      styleGuide.typography.examples.forEach(ex => {
        const parts = ex.details.split(',').map(s => s.trim().toLowerCase());
        parts.forEach(part => {
          if (weightMap[part]) {
            weights.add(weightMap[part]);
          }
        });
      });

      if (weights.size === 0) {
        weights.add(400);
        weights.add(700);
      }

      const sortedWeights = Array.from(weights).sort((a, b) => a - b);
      const weightsString = sortedWeights.join(';');

      if (fontName && weightsString) {
        const linkId = `font-link-${fontName.replace(/\s+/g, '-')}`;
        const existingLink = document.getElementById(linkId) as HTMLLinkElement;
        const newHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@${weightsString}&display=swap`;

        if (!existingLink) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = newHref;
          document.head.appendChild(link);
        } else if (existingLink.href !== newHref) {
          existingLink.href = newHref;
        }
      }
    }
  }, [styleGuide.typography.font_family, styleGuide.typography.examples]);


  const handlePinTypography = () => {
    const typographyContent = `
Typography: ${styleGuide.typography.font_family}
${styleGuide.typography.examples.map(ex => `- ${ex.role}: ${ex.details}`).join('\n')}
    `.trim();
    onAddTag(typographyContent);
  };

  const handlePinLayout = () => {
    const layoutContent = `
Layout: ${styleGuide.layout.pattern}
${styleGuide.layout.description}
    `.trim();
    onAddTag(layoutContent);
  };

  const ColorSwatch: React.FC<{ name: string, hex: string }> = ({ name, hex }) => (
    <div className="flex items-center gap-2" role="img" aria-label={`${name} color: ${hex}`}>
      <div className="w-6 h-6 rounded-full border-2 border-white/30" style={{ backgroundColor: hex }} />
      <div>
        <div className="font-semibold text-white capitalize">{name}</div>
        <div className="font-mono text-xs text-gray-400">{hex}</div>
      </div>
    </div>
  );

  return (
    <div
      data-pin-id={pin.id}
      className={`absolute w-[380px] bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing border border-white/20 transition-all ${ringClass} ${zIndexClass} hover:scale-[1.02] hover:shadow-2xl active:scale-[1.01]`}
      style={{
        left: `${pin.x}px`,
        top: `${pin.y}px`,
        boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.5)' : undefined,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="p-4 relative" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
            <h3 className="text-lg font-bold text-indigo-300">Style Guide</h3>
            <button
                onClick={() => onDelete(pin.id)}
                onMouseDown={e => e.stopPropagation()}
                className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 transition-all active:scale-90"
                aria-label="Close style guide card"
                title="Close style guide card"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="space-y-4 text-sm max-h-96 overflow-y-auto pr-2">
            {/* Colors */}
            <div>
                <strong className="text-gray-300 block mb-2">Colors</strong>
                <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-lg">
                    <ColorSwatch name="Primary" hex={styleGuide.colors.primary} />
                    <ColorSwatch name="Secondary" hex={styleGuide.colors.secondary} />
                    <ColorSwatch name="Accent" hex={styleGuide.colors.accent} />
                    <ColorSwatch name="Neutral" hex={styleGuide.colors.neutral} />
                </div>
            </div>
            
            {/* Typography */}
            <button
              onClick={handlePinTypography}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full text-left bg-black/30 p-3 rounded-lg hover:bg-black/40 transition-colors cursor-pointer active:bg-black/50"
              title="Pin typography guide as a note"
              style={{ fontFamily: styleGuide.typography.font_family }}
            >
                <strong className="text-gray-300 block mb-1">Typography</strong>
                <div>
                    <p className="font-semibold text-white mb-2">{styleGuide.typography.font_family}</p>
                    <div className="space-y-1">
                        {styleGuide.typography.examples.map(ex => (
                            <div key={ex.role} className="flex justify-between items-baseline">
                                <span className="text-gray-200" style={{...parseTypographyDetails(ex.details), textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>
                                    {ex.role}
                                </span>
                                <span className="text-gray-400 text-xs">{ex.details}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </button>

            {/* Layout */}
            <button
              onClick={handlePinLayout}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full text-left bg-black/30 p-3 rounded-lg hover:bg-black/40 transition-colors cursor-pointer active:bg-black/50"
              title="Pin layout guide as a note"
            >
                <strong className="text-gray-300 block mb-1">Layout</strong>
                <div>
                    <p className="font-semibold text-white">{styleGuide.layout.pattern}</p>
                    <p className="text-gray-400 text-xs">{styleGuide.layout.description}</p>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default StyleGuidePinComponent;
