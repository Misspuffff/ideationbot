
import { useState, useCallback } from 'react';

type SetStateAction<T> = T | ((prevState: T) => T);

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useHistoryState = <T>(initialState: T) => {
  const [state, setHistoryState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const setState = useCallback((action: SetStateAction<T>) => {
    const { present } = state;
    const newState = typeof action === 'function' 
        ? (action as (prevState: T) => T)(present) 
        : action;

    if (JSON.stringify(newState) === JSON.stringify(present)) {
      return;
    }
    
    setHistoryState({
      past: [...state.past, present],
      present: newState,
      future: [],
    });
  }, [state]);

  const undo = useCallback(() => {
    if (!canUndo) {
      return;
    }
    const { past, present, future } = state;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setHistoryState({
      past: newPast,
      present: previous,
      future: [present, ...future],
    });
  }, [canUndo, state]);

  const redo = useCallback(() => {
    if (!canRedo) {
      return;
    }
    const { past, present, future } = state;
    const next = future[0];
    const newFuture = future.slice(1);
    setHistoryState({
      past: [...past, present],
      present: next,
      future: newFuture,
    });
  }, [canRedo, state]);

  const reset = useCallback((newState: T) => {
    setHistoryState({
        past: [],
        present: newState,
        future: [],
    });
  }, []);

  return { state: state.present, setState, undo, redo, canUndo, canRedo, reset };
};
