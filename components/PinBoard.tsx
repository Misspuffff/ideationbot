import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { Pin, ImagePin, Link, LinkSide, ResizeCorner, TextPin, BoardDnaPin, ImageSuggestionsPin, RemixesPin, DoNextPin, ColorPin, StyleGuidePin, TagPin } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import ImagePinComponent from './pins/ImagePin';
import TextPinComponent from './pins/TextPin';
import ColorPinComponent from './pins/ColorPin';
// FIX: Replaced single AnalysisReportPinComponent with specific component imports for each analysis type.
import BoardDnaPinComponent from './pins/BoardDnaPin';
import ImageSuggestionsPinComponent from './pins/ImageSuggestionsPin';
import RemixesPinComponent from './pins/RemixesPin';
import DoNextPinComponent from './pins/DoNextPin';
import StyleGuidePinComponent from './pins/StyleGuidePin';
import TagPinComponent from './pins/TagPin';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import LinkLayer from './LinkLayer';
import { ResetViewIcon } from './icons/ResetViewIcon';
import SelectionToolbar from './SelectionToolbar';
import { summarizePins, SummarizablePin } from '../services/geminiService';
import ResizeHandle from './shared/ResizeHandle';

interface PinBoardProps {
  pins: Pin[];
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>;
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  newlyGeneratedImage: {url: string, file: File} | null;
  onImagePinned: () => void;
  onGenerateImage: (prompt: string, cardId: string) => void;
  onGenerateFromTag: (tag: string) => void;
  isGeneratingFromTag: boolean;
  generatingImageId: string | null;
  onAddColorFromDna: (hex: string) => void;
  onAddTagAsNote: (tag: string) => void;
  onAddTagAsTagPin: (tag: string, category: 'form' | 'material' | 'lever' | 'default') => void;
  onDeletePin: (id: string) => void;
  onUpdatePin: (pinId: string, updates: Partial<Pin>) => void;
  onUpdateLink: (id: string, color: string) => void;
  selectedPinIds: string[];
  setSelectedPinIds: React.Dispatch<React.SetStateAction<Pin[]>>;
}

interface DragState {
  draggedPinId: string;
  mouseOffset: { x: number; y: number };
  initialPinPositions: Map<string, {x: number, y: number}>;
}

type ResizeState = { 
    type: 'pin',
    pinId: string;
    corner: ResizeCorner;
    initialRect: { x: number; y: number; width: number; height: number };
    startPoint: { x: number; y: number };
    aspectRatio: number | null;
} | {
    type: 'group',
    corner: ResizeCorner;
    initialBounds: { top: number; left: number; width: number; height: number; };
    initialPinState: Map<string, { x: number; y: number; width: number; height: number; }>;
    startPoint: { x: number; y: number };
};


const getClosestSide = (pin: Pin, point: { x: number, y: number }): LinkSide => {
    const width = pin.width ?? 150;
    const height = pin.height ?? 150;

    const top = { x: pin.x + width / 2, y: pin.y };
    const right = { x: pin.x + width, y: pin.y + height / 2 };
    const bottom = { x: pin.x + width / 2, y: pin.y + height };
    const left = { x: pin.x, y: pin.y + height / 2 };

    const distSq = (p1: {x:number, y:number}, p2: {x:number, y:number}) => (p1.x - p2.x)**2 + (p1.y - p2.y)**2;

    const distances: { side: LinkSide, dist: number }[] = [
        { side: 'top', dist: distSq(point, top) },
        { side: 'right', dist: distSq(point, right) },
        { side: 'bottom', dist: distSq(point, bottom) },
        { side: 'left', dist: distSq(point, left) },
    ];
    
    return distances.reduce((closest, current) => current.dist < closest.dist ? current : closest).side;
};

const PinBoard = forwardRef((
  { pins, setPins, links, setLinks, newlyGeneratedImage, onImagePinned, onGenerateImage, onGenerateFromTag, isGeneratingFromTag, generatingImageId, onAddColorFromDna, onAddTagAsNote, onAddTagAsTagPin, onDeletePin, onUpdatePin, onUpdateLink, selectedPinIds, setSelectedPinIds }: PinBoardProps, 
  ref
  ) => {
  const boardContainerRef = useRef<HTMLDivElement>(null);
  
  const [localPins, setLocalPins] = useState<Pin[]>(pins);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const panState = useRef({ isPanning: false, startPoint: { x: 0, y: 0 } });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [linkingState, setLinkingState] = useState<{ fromPinId: string; fromSide: LinkSide; endPoint: { x: number; y: number } } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [marqueeState, setMarqueeState] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);


  useEffect(() => {
    setLocalPins(pins);
  }, [pins]);

  useImperativeHandle(ref, () => ({
    getCenter: () => {
      if (boardContainerRef.current) {
        const board = boardContainerRef.current.getBoundingClientRect();
        return {
          x: (board.width / 2 - transform.x) / transform.scale,
          y: (board.height / 2 - transform.y) / transform.scale,
        };
      }
      return { x: 0, y: 0 };
    }
  }));

  useEffect(() => {
    if (newlyGeneratedImage && boardContainerRef.current) {
      const { x, y } = (ref as any).current.getCenter();
      
      const img = new Image();
      img.onload = () => {
          // Scale image to a max initial size
          const MAX_SIZE = 250;
          let newWidth = img.naturalWidth;
          let newHeight = img.naturalHeight;

          if (newWidth > MAX_SIZE || newHeight > MAX_SIZE) {
              if (img.naturalWidth > img.naturalHeight) {
                  newHeight = (MAX_SIZE / newWidth) * newHeight;
                  newWidth = MAX_SIZE;
              } else {
                  newWidth = (MAX_SIZE / newHeight) * newWidth;
                  newHeight = MAX_SIZE;
              }
          }

          const newPin: ImagePin = {
            id: `pin-${Date.now()}`,
            type: 'image',
            url: newlyGeneratedImage.url,
            file: newlyGeneratedImage.file,
            x,
            y,
            width: newWidth,
            height: newHeight
          };
          setPins(prevPins => [...prevPins, newPin]);
          onImagePinned(); // Reset the state in App.tsx
          URL.revokeObjectURL(img.src);
      };
      img.src = newlyGeneratedImage.url;
    }
  }, [newlyGeneratedImage, onImagePinned, setPins, ref]);

  const onBoardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent starting an action if clicking a button or other interactive element
    if ((e.target as HTMLElement).closest('input, textarea, button, a')) {
        return;
    }

    const targetIsPin = (e.target as HTMLElement).closest('[data-pin-id]');
    const targetIsResizeHandle = (e.target as HTMLElement).closest('[data-resize-handle]');

    if (targetIsPin || targetIsResizeHandle) return;

    // MARQUEE SELECTION
    if (!e.shiftKey) {
        setSelectedPinIds([]);
    }
    const startX = (e.clientX - transform.x) / transform.scale;
    const startY = (e.clientY - transform.y) / transform.scale;
    setMarqueeState({ startX, startY, endX: startX, endY: startY });

    // PANNING
    e.preventDefault();
    panState.current = {
        isPanning: true,
        startPoint: { x: e.clientX - transform.x, y: e.clientY - transform.y },
    };
    if (boardContainerRef.current) boardContainerRef.current.style.cursor = 'grabbing';
  };

  const onPinMouseDown = (e: React.MouseEvent<HTMLDivElement>, pinId: string) => {
    e.stopPropagation();
    const pin = localPins.find(p => p.id === pinId);
    if (!pin) return;

    // --- SELECTION LOGIC ---
    if (e.shiftKey) {
        setSelectedPinIds(ids => 
            ids.includes(pinId) 
                ? ids.filter(id => id !== pinId) 
                : [...ids, pinId]
        );
    } else if (!selectedPinIds.includes(pinId)) {
        setSelectedPinIds([pinId]);
    }
    // If we click a selected pin (without shift), we don't deselect others,
    // allowing us to drag the whole group.

    // --- DRAG LOGIC ---
    const isPinSelected = selectedPinIds.includes(pinId) || e.shiftKey;
    const dragIds = isPinSelected ? selectedPinIds : [pinId];
    if (e.shiftKey && !selectedPinIds.includes(pinId)) {
      // If adding to selection, make sure this newly selected pin is included
      dragIds.push(pinId);
    }

    const initialPinPositions = new Map<string, { x: number; y: number }>();
    dragIds.forEach(id => {
        const p = localPins.find(p => p.id === id);
        if (p) initialPinPositions.set(id, { x: p.x, y: p.y });
    });
    
    setDragState({
      draggedPinId: pinId,
      mouseOffset: { 
        x: e.clientX / transform.scale - pin.x,
        y: e.clientY / transform.scale - pin.y,
      },
      initialPinPositions,
    });
  };

  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, pinId: string, corner: ResizeCorner) => {
    e.stopPropagation();
    const pin = localPins.find(p => p.id === pinId);
    if (!pin || !pin.width || !pin.height) return;

    setResizeState({
        type: 'pin',
        pinId,
        corner,
        initialRect: { x: pin.x, y: pin.y, width: pin.width, height: pin.height },
        startPoint: { x: e.clientX, y: e.clientY },
        aspectRatio: pin.type === 'image' ? pin.width / pin.height : null,
    });
  };

  const onGroupResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, corner: ResizeCorner) => {
    e.stopPropagation();
    if (!selectionBounds) return;
    
    const initialPinState = new Map<string, { x: number, y: number, width: number, height: number }>();
    selectedPinIds.forEach(id => {
        const pin = localPins.find(p => p.id === id);
        if (pin) {
            initialPinState.set(id, {
                x: pin.x,
                y: pin.y,
                width: pin.width ?? 150,
                height: pin.height ?? 150
            });
        }
    });

    setResizeState({
        type: 'group',
        corner,
        initialBounds: {
            left: selectionBounds.left,
            top: selectionBounds.top,
            width: selectionBounds.width,
            height: selectionBounds.height,
        },
        initialPinState,
        startPoint: { x: e.clientX, y: e.clientY }
    });
  };

  const handleStartLinking = (e: React.MouseEvent<HTMLDivElement>, pinId: string, side: LinkSide) => {
    e.stopPropagation();
    setLinkingState({
      fromPinId: pinId,
      fromSide: side,
      endPoint: {
        x: (e.clientX - transform.x) / transform.scale,
        y: (e.clientY - transform.y) / transform.scale
      }
    });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (marqueeState && !panState.current.isPanning) {
        setMarqueeState(prev => ({
            ...prev!,
            endX: (e.clientX - transform.x) / transform.scale,
            endY: (e.clientY - transform.y) / transform.scale,
        }));
        return;
    }

    if (linkingState) {
        setLinkingState(prevState => ({
          ...prevState!,
          endPoint: {
            x: (e.clientX - transform.x) / transform.scale,
            y: (e.clientY - transform.y) / transform.scale
          }
        }));
        return;
    }
    
    if (resizeState?.type === 'pin') {
        const { pinId, initialRect, startPoint, aspectRatio, corner } = resizeState;
        const dx = (e.clientX - startPoint.x) / transform.scale;
        const dy = (e.clientY - startPoint.y) / transform.scale;

        const minWidth = 50;
        const minHeight = 50;

        let newX = initialRect.x;
        let newY = initialRect.y;
        let newWidth = initialRect.width;
        let newHeight = initialRect.height;

        // Calculate new dimensions and position based on corner
        if (corner === 'bottom-right') {
            newWidth = initialRect.width + dx;
            newHeight = initialRect.height + dy;
        } else if (corner === 'bottom-left') {
            newWidth = initialRect.width - dx;
            newHeight = initialRect.height + dy;
            newX = initialRect.x + dx;
        } else if (corner === 'top-right') {
            newWidth = initialRect.width + dx;
            newHeight = initialRect.height - dy;
            newY = initialRect.y + dy;
        } else if (corner === 'top-left') {
            newWidth = initialRect.width - dx;
            newHeight = initialRect.height - dy;
            newX = initialRect.x + dx;
            newY = initialRect.y + dy;
        }
        
        // Apply aspect ratio constraint if it exists
        if (aspectRatio) {
            if (Math.abs(newWidth - initialRect.width) / initialRect.width > Math.abs(newHeight - initialRect.height) / initialRect.height) {
                newHeight = newWidth / aspectRatio;
            } else {
                newWidth = newHeight * aspectRatio;
            }
        }

        // Apply minimum size constraints, recalculating the other dimension if aspect ratio is locked
        if (newWidth < minWidth) {
            newWidth = minWidth;
            if (aspectRatio) newHeight = newWidth / aspectRatio;
        }
        if (newHeight < minHeight) {
            newHeight = minHeight;
            if (aspectRatio) newWidth = newHeight * aspectRatio;
        }
        
        // Recalculate position based on final dimensions and corner
        if (corner === 'bottom-left') {
            newX = initialRect.x + (initialRect.width - newWidth);
        } else if (corner === 'top-right') {
            newY = initialRect.y + (initialRect.height - newHeight);
        } else if (corner === 'top-left') {
            newX = initialRect.x + (initialRect.width - newWidth);
            newY = initialRect.y + (initialRect.height - newHeight);
        }

        setLocalPins(currentPins =>
            currentPins.map(p =>
                p.id === pinId ? { ...p, x: newX, y: newY, width: newWidth, height: newHeight } : p
            )
        );
    } else if (resizeState?.type === 'group') {
        const { initialBounds, initialPinState, startPoint, corner } = resizeState;
        const dx = (e.clientX - startPoint.x) / transform.scale;
        const dy = (e.clientY - startPoint.y) / transform.scale;
        
        let newLeft = initialBounds.left;
        let newTop = initialBounds.top;
        let newWidth = initialBounds.width;
        let newHeight = initialBounds.height;
        
        if (corner.includes('right')) newWidth = initialBounds.width + dx;
        if (corner.includes('left')) {
            newWidth = initialBounds.width - dx;
            newLeft = initialBounds.left + dx;
        }
        if (corner.includes('bottom')) newHeight = initialBounds.height + dy;
        if (corner.includes('top')) {
            newHeight = initialBounds.height - dy;
            newTop = initialBounds.top + dy;
        }

        if (newWidth < 50) newWidth = 50;
        if (newHeight < 50) newHeight = 50;

        const scaleX = initialBounds.width > 0 ? newWidth / initialBounds.width : 1;
        const scaleY = initialBounds.height > 0 ? newHeight / initialBounds.height : 1;
        
        setLocalPins(currentPins => currentPins.map(pin => {
            const initialState = initialPinState.get(pin.id);
            if (!initialState) return pin;

            const relX = (initialState.x - initialBounds.left) / initialBounds.width;
            const relY = (initialState.y - initialBounds.top) / initialBounds.height;
            
            const newPinX = newLeft + relX * newWidth;
            const newPinY = newTop + relY * newHeight;
            const newPinWidth = initialState.width * scaleX;
            const newPinHeight = initialState.height * scaleY;
            
            return {...pin, x: newPinX, y: newPinY, width: newPinWidth, height: newPinHeight };
        }));

    } else if (dragState) {
        panState.current.isPanning = false; // Prevent panning while dragging pins
        if(marqueeState) setMarqueeState(null); // Prevent marquee selection while dragging

        const mainPinInitialPos = dragState.initialPinPositions.get(dragState.draggedPinId);
        if (!mainPinInitialPos) return;

        const mouseX = e.clientX / transform.scale - dragState.mouseOffset.x;
        const mouseY = e.clientY / transform.scale - dragState.mouseOffset.y;
        
        const deltaX = mouseX - mainPinInitialPos.x;
        const deltaY = mouseY - mainPinInitialPos.y;

        setLocalPins(currentPins =>
            currentPins.map(p => {
                const initialPos = dragState.initialPinPositions.get(p.id);
                if (initialPos) {
                    return { ...p, x: initialPos.x + deltaX, y: initialPos.y + deltaY };
                }
                return p;
            })
        );
    } else if (panState.current.isPanning) {
      if (marqueeState) setMarqueeState(null); // Cancel marquee if we start panning
      setTransform(t => ({
          ...t,
        x: e.clientX - panState.current.startPoint.x,
        y: e.clientY - panState.current.startPoint.y,
      }));
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (marqueeState && !panState.current.isPanning) {
        const marqueeRect = {
            minX: Math.min(marqueeState.startX, marqueeState.endX),
            maxX: Math.max(marqueeState.startX, marqueeState.endX),
            minY: Math.min(marqueeState.startY, marqueeState.endY),
            maxY: Math.max(marqueeState.startY, marqueeState.endY),
        };
        // Don't select if marquee is just a click
        if (marqueeRect.maxX - marqueeRect.minX > 5 || marqueeRect.maxY - marqueeRect.minY > 5) {
            const idsToAdd = localPins.filter(pin => {
                const pinWidth = pin.width ?? 150;
                const pinHeight = pin.height ?? 150;
                // Check for intersection
                return pin.x < marqueeRect.maxX && pin.x + pinWidth > marqueeRect.minX &&
                       pin.y < marqueeRect.maxY && pin.y + pinHeight > marqueeRect.minY;
            }).map(pin => pin.id);
            
            if (e.shiftKey) {
                setSelectedPinIds(prevIds => [...new Set([...prevIds, ...idsToAdd])]);
            } else {
                setSelectedPinIds(idsToAdd);
            }
        }
    }
    setMarqueeState(null);

    if (linkingState) {
      const targetElement = document.elementFromPoint(e.clientX, e.clientY);
      const pinElement = targetElement?.closest('[data-pin-id]');
      const toPinId = pinElement?.getAttribute('data-pin-id');
      const toPin = localPins.find(p => p.id === toPinId);

      if (toPin && toPin.id !== linkingState.fromPinId) {
        const dropPoint = {
          x: (e.clientX - transform.x) / transform.scale,
          y: (e.clientY - transform.y) / transform.scale,
        };
        const toSide = getClosestSide(toPin, dropPoint);

        const newLink: Link = {
          id: `link-${Date.now()}`,
          from: linkingState.fromPinId,
          to: toPin.id,
          fromSide: linkingState.fromSide,
          toSide: toSide,
        };
        // Avoid creating duplicate links
        const linkExists = links.some(
          l => (l.from === newLink.from && l.to === newLink.to) || (l.from === newLink.to && l.to === newLink.from)
        );
        if (!linkExists) {
            setLinks(prevLinks => [...prevLinks, newLink]);
        }
      }
      setLinkingState(null);
    }

    if (panState.current.isPanning) {
      panState.current.isPanning = false;
      if (boardContainerRef.current) boardContainerRef.current.style.cursor = 'grab';
    }
    
    if (dragState || resizeState) {
      setPins(localPins);
    }
    
    if (dragState) {
      setDragState(null);
    }
    if (resizeState) {
      setResizeState(null);
    }
  };

  const onMouseLeave = () => {
    // Cancel any ongoing actions if mouse leaves the board
    if (linkingState) setLinkingState(null);
    if (panState.current.isPanning) panState.current.isPanning = false;
    if (dragState || resizeState) setPins(localPins);
    if (dragState) setDragState(null);
    if (resizeState) setResizeState(null);
    if (marqueeState) setMarqueeState(null);
  };
  
  const handleZoom = useCallback((scaleDelta: number) => {
    if (!boardContainerRef.current) return;

    const currentScale = transform.scale;
    const newScale = Math.min(Math.max(0.2, currentScale + scaleDelta), 3);

    if (newScale === currentScale) return;

    const rect = boardContainerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newX = centerX - (centerX - transform.x) * (newScale / currentScale);
    const newY = centerY - (centerY - transform.y) * (newScale / currentScale);

    setTransform({ x: newX, y: newY, scale: newScale });
  }, [transform.scale, transform.x, transform.y]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
            return;
        }

        const PAN_STEP = 25;
        const ZOOM_STEP = 0.1;

        let handled = true;
        switch (e.key) {
            case 'ArrowUp':
                setTransform(t => ({ ...t, y: t.y + PAN_STEP }));
                break;
            case 'ArrowDown':
                setTransform(t => ({ ...t, y: t.y - PAN_STEP }));
                break;
            case 'ArrowLeft':
                setTransform(t => ({ ...t, x: t.x + PAN_STEP }));
                break;
            case 'ArrowRight':
                setTransform(t => ({ ...t, x: t.x - PAN_STEP }));
                break;
            case '+':
            case '=':
                handleZoom(ZOOM_STEP);
                break;
            case '-':
                handleZoom(-ZOOM_STEP);
                break;
            default:
                handled = false;
        }

        if (handled) {
            e.preventDefault();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleZoom]);


  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const scaleAmount = -e.deltaY * 0.001;
      const newScale = Math.min(Math.max(0.2, transform.scale + scaleAmount), 3);
      
      const rect = boardContainerRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
      const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

      setTransform({ x: newX, y: newY, scale: newScale });
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const selectionBounds = useMemo(() => {
    if (selectedPinIds.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    selectedPinIds.forEach(id => {
      const pin = localPins.find(p => p.id === id);
      if (pin) {
        minX = Math.min(minX, pin.x);
        minY = Math.min(minY, pin.y);
        const pinWidth = pin.width ?? 150;
        const pinHeight = pin.height ?? 150;
        maxX = Math.max(maxX, pin.x + pinWidth);
        maxY = Math.max(maxY, pin.y + pinHeight);
      }
    });

    if (minX === Infinity) return null;

    return {
      top: minY,
      left: minX,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [selectedPinIds, localPins]);

  const handleSummarizeSelection = async () => {
    if (selectedPinIds.length < 2) return;
    
    setIsSummarizing(true);
    try {
        const selectedPins = selectedPinIds.map(id => pins.find(p => p.id === id)).filter(Boolean) as Pin[];
        
        const summarizablePins: SummarizablePin[] = selectedPins.map(pin => {
            switch(pin.type) {
                case 'image': return { type: 'image', file: (pin as ImagePin).file };
                case 'text': return { type: 'text', content: (pin as TextPin).content };
                case 'color': return { type: 'color', content: (pin as ColorPin).hex };
                case 'board-dna': return { type: 'data', content: `Board DNA: ${JSON.stringify((pin as BoardDnaPin).dna)}`};
                case 'image-suggestions': return { type: 'data', content: `Image Suggestions: ${(pin as ImageSuggestionsPin).suggestions.map(s => s.prompt).join(', ')}`};
                case 'remixes': return { type: 'data', content: `Remixes: ${(pin as RemixesPin).remixes.map(r => r.name).join(', ')}`};
                case 'do-next': return { type: 'data', content: `Next actions: ${(pin as DoNextPin).doNext.join(', ')}`};
                case 'style-guide': return { type: 'data', content: `Style Guide: ${JSON.stringify((pin as StyleGuidePin).styleGuide)}`};
                default: return null;
            }
        }).filter(Boolean) as SummarizablePin[];

        const summary = await summarizePins(summarizablePins);

        if (summary && selectionBounds) {
            const newTextPin: TextPin = {
                id: `text-summary-${Date.now()}`,
                type: 'text',
                content: summary,
                color: 'yellow',
                x: selectionBounds.left + selectionBounds.width / 2 - 125, // Center it
                y: selectionBounds.top + selectionBounds.height + 20, // Position below selection
                width: 250,
                height: 150,
            };
            setPins(prev => [...prev, newTextPin]);
            setSelectedPinIds([]);
        }

    } catch (error) {
        console.error("Failed to summarize pins:", error);
    } finally {
        setIsSummarizing(false);
    }
  };


  const renderPin = (pin: Pin) => {
    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => onPinMouseDown(e, pin.id);
    const onResizeStart = (e: React.MouseEvent<HTMLDivElement>, corner: ResizeCorner) => onResizeMouseDown(e, pin.id, corner);
    const onStartLink = (e: React.MouseEvent<HTMLDivElement>, side: LinkSide) => handleStartLinking(e, pin.id, side);
    const isDragging = dragState?.initialPinPositions.has(pin.id);
    const isResizing = resizeState?.type === 'pin' && resizeState?.pinId === pin.id;
    const isSelected = selectedPinIds.includes(pin.id);
    
    // FIX: Updated switch to render specific analysis pins, removing the obsolete 'analysis-report' case.
    switch (pin.type) {
      case 'image':
        return <ImagePinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onDelete={onDeletePin} onResizeMouseDown={onResizeStart} onStartLinking={onStartLink} isDragging={isDragging} isResizing={isResizing} isSelected={isSelected} />;
      case 'text':
        return <TextPinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onDelete={onDeletePin} onResizeMouseDown={onResizeStart} onStartLinking={onStartLink} onUpdatePin={onUpdatePin} isDragging={isDragging} isResizing={isResizing} isSelected={isSelected} />;
      case 'color':
        return <ColorPinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onDelete={onDeletePin} onResizeMouseDown={onResizeStart} onStartLinking={onStartLink} isDragging={isDragging} isResizing={isResizing} isSelected={isSelected} />;
      case 'board-dna':
        return <BoardDnaPinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onAddColor={onAddColorFromDna} onAddTag={onAddTagAsNote} onAddTagAsTagPin={onAddTagAsTagPin} onDelete={onDeletePin} isSelected={isSelected} onGenerateFromTag={onGenerateFromTag} isGeneratingFromTag={isGeneratingFromTag} />;
      case 'image-suggestions':
        return <ImageSuggestionsPinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onGenerateImage={onGenerateImage} generatingImageId={generatingImageId} onDelete={onDeletePin} isSelected={isSelected} />;
      case 'remixes':
        return <RemixesPinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onAddTag={onAddTagAsNote} onDelete={onDeletePin} isSelected={isSelected} />;
      case 'do-next':
        return <DoNextPinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onDelete={onDeletePin} isSelected={isSelected} />;
      case 'style-guide':
        return <StyleGuidePinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onDelete={onDeletePin} isSelected={isSelected} onAddTag={onAddTagAsNote} />;
      case 'tag':
        return <TagPinComponent key={pin.id} pin={pin} onMouseDown={onMouseDown} onDelete={onDeletePin} onStartLinking={onStartLink} isDragging={isDragging} isSelected={isSelected} />;
      default:
        const exhaustiveCheck: never = pin;
        return null;
    }
  };

  const marqueeRect = useMemo(() => {
    if (!marqueeState) return null;
    return {
        left: Math.min(marqueeState.startX, marqueeState.endX),
        top: Math.min(marqueeState.startY, marqueeState.endY),
        // FIX: Math.abs takes a single argument. Calculate the difference first.
        width: Math.abs(marqueeState.startX - marqueeState.endX),
        // FIX: Math.abs takes a single argument. Calculate the difference first.
        height: Math.abs(marqueeState.startY - marqueeState.endY),
    };
  }, [marqueeState]);

  return (
    <div 
      ref={boardContainerRef}
      className="w-full h-full border border-white/10 relative overflow-hidden select-none cursor-grab"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseDown={onBoardMouseDown}
      onWheel={onWheel}
      role="region"
      aria-label="FlowBoard Canvas"
    >
      <LinkLayer 
        pins={localPins}
        links={links}
        linkingState={linkingState}
        onDeleteLink={handleDeleteLink}
        onUpdateLink={onUpdateLink}
        transform={transform}
      />
      <div 
        className="absolute top-0 left-0"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
      >
        {selectionBounds && (
            <>
                <div
                    className="absolute border-2 border-blue-400 pointer-events-none"
                    style={{
                        left: selectionBounds.left,
                        top: selectionBounds.top,
                        width: selectionBounds.width,
                        height: selectionBounds.height,
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                    }}
                >
                    <ResizeHandle position="top-left" onMouseDown={(e) => onGroupResizeMouseDown(e, 'top-left')} />
                    <ResizeHandle position="top-right" onMouseDown={(e) => onGroupResizeMouseDown(e, 'top-right')} />
                    <ResizeHandle position="bottom-left" onMouseDown={(e) => onGroupResizeMouseDown(e, 'bottom-left')} />
                    <ResizeHandle position="bottom-right" onMouseDown={(e) => onGroupResizeMouseDown(e, 'bottom-right')} />
                </div>
                <SelectionToolbar
                    bounds={selectionBounds}
                    onSummarize={handleSummarizeSelection}
                    isSummarizing={isSummarizing}
                    count={selectedPinIds.length}
                />
            </>
        )}
        {marqueeRect && (
            <div
                className="absolute bg-blue-500/20 border-2 border-blue-400 pointer-events-none"
                style={marqueeRect}
            />
        )}
        {localPins.map(renderPin)}
      </div>

      {localPins.length === 0 && (
        <div 
          className="absolute inset-4 flex flex-col justify-center items-center text-center text-gray-300 border-2 border-dashed border-white/20 rounded-2xl cursor-default pointer-events-none bg-black/20 backdrop-blur-lg p-4"
        >
          <UploadIcon className="w-12 h-12 mb-4 text-gray-500" />
          <p className="font-semibold text-lg text-white">Let's make something amazing.</p>
          <p className="text-sm max-w-xs mx-auto">This board is our playground. Pin an image, a note, or a color to get started. Let's see what ideas we can spark together!</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-20 flex items-center bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg p-1">
        <button
          onClick={() => handleZoom(-0.1)}
          disabled={transform.scale <= 0.2}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md disabled:text-gray-600 disabled:cursor-not-allowed transition-all active:scale-90"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOutIcon className="w-5 h-5" />
        </button>
        <button
            onClick={handleResetView}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-all active:scale-90"
            aria-label="Reset view"
            title="Reset view (100%)"
        >
            <ResetViewIcon className="w-5 h-5" />
        </button>
        <span
          className="px-3 text-sm font-semibold text-gray-200 w-16 text-center tabular-nums"
          aria-label={`Current zoom level ${Math.round(transform.scale * 100)}%`}
        >
          {Math.round(transform.scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(0.1)}
          disabled={transform.scale >= 3}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md disabled:text-gray-600 disabled:cursor-not-allowed transition-all active:scale-90"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomInIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

export default PinBoard;