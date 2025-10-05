import React, { useRef, useEffect } from 'react';
import { GenerateIcon } from '../icons/GenerateIcon';
import { TextIcon } from '../icons/TextIcon';
import { TagIcon } from '../icons/TagIcon';

interface TagActionPopoverProps {
  tag: string;
  position: { top: number; left: number };
  isGenerating: boolean;
  onPinTag: () => void;
  onPinAsNote: () => void;
  onGenerate: () => void;
  onClose: () => void;
}

const ActionButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    role="menuitem"
    tabIndex={-1} // Makes it focusable via script but not via Tab key
    className="w-full flex items-center gap-3 text-left px-3 py-2 text-sm text-gray-200 rounded-md hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
  >
    {children}
  </button>
);

const TagActionPopover: React.FC<TagActionPopoverProps> = ({ tag, position, isGenerating, onPinTag, onPinAsNote, onGenerate, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Use setTimeout to avoid capturing the same click that opened the popover
    setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (!popoverRef.current) return;

    const items = Array.from(popoverRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (items.length === 0) return;

    // FIX: Cast element to HTMLElement to ensure 'focus' method is available. The type was being inferred as 'unknown'.
    (items[0] as HTMLElement).focus(); // Focus first item on open

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeIndex = items.findIndex(item => item === document.activeElement);

      let nextIndex = -1;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nextIndex = (activeIndex + 1) % items.length;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        nextIndex = (activeIndex - 1 + items.length) % items.length;
      } else if (event.key === 'Home') {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === 'End') {
        event.preventDefault();
        nextIndex = items.length - 1;
      } else if (event.key === 'Tab') {
        // Trap focus
        event.preventDefault();
      }

      if (nextIndex !== -1) {
        // FIX: Cast element to HTMLElement to ensure 'focus' method is available. The type was being inferred as 'unknown'.
        (items[nextIndex] as HTMLElement).focus();
      }
    };

    const popoverElement = popoverRef.current;
    popoverElement.addEventListener('keydown', handleKeyDown);

    return () => {
      popoverElement.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Run only once when the component mounts

  return (
    <div
      ref={popoverRef}
      role="menu"
      aria-label={`Actions for tag "${tag}"`}
      className="fixed z-50 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col items-stretch gap-1 animate-fade-in-fast min-w-[180px]"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="text-center text-indigo-300 text-sm font-bold px-3 py-1 mb-1 border-b border-white/10 truncate" title={tag}>
        {tag}
      </div>
      <ActionButton onClick={onPinTag}>
        <TagIcon className="w-4 h-4 text-gray-400" aria-hidden="true" /> Pin Tag
      </ActionButton>
      <ActionButton onClick={onPinAsNote}>
        <TextIcon className="w-4 h-4 text-gray-400" aria-hidden="true" /> Pin as Note
      </ActionButton>
      <ActionButton onClick={onGenerate} disabled={isGenerating}>
        <GenerateIcon className="w-4 h-4 text-gray-400" aria-hidden="true" /> {isGenerating ? 'Generating...' : 'Generate Image'}
      </ActionButton>
    </div>
  );
};

export default TagActionPopover;
