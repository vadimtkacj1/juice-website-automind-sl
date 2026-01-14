'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type TextMode = 'hebrew' | 'english';

interface TextModeContextType {
  textMode: TextMode;
  setTextMode: (mode: TextMode) => void;
}

const TextModeContext = createContext<TextModeContextType | undefined>(undefined);

export function TextModeProvider({ children }: { children: ReactNode }) {
  const [textMode, setTextModeState] = useState<TextMode>('hebrew');

  useEffect(() => {
    // Load saved preference from localStorage
    const savedMode = localStorage.getItem('text-mode') as TextMode;
    if (savedMode === 'hebrew' || savedMode === 'english') {
      setTextModeState(savedMode);
      applyTextMode(savedMode);
    } else {
      applyTextMode('hebrew');
    }
  }, []);

  const applyTextMode = (mode: TextMode) => {
    document.documentElement.setAttribute('data-text-mode', mode);
    if (mode === 'english') {
      document.documentElement.classList.add('english-mode');
      document.documentElement.classList.remove('hebrew-mode');
    } else {
      document.documentElement.classList.add('hebrew-mode');
      document.documentElement.classList.remove('english-mode');
    }
    // Update global variable for translateToHebrew function
    if (typeof window !== 'undefined') {
      (window as any).__textMode = mode;
    }
  };

  const setTextMode = (mode: TextMode) => {
    setTextModeState(mode);
    applyTextMode(mode);
    localStorage.setItem('text-mode', mode);
    // Dispatch custom event to trigger re-renders in components using translateToHebrew
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('textModeChanged', { detail: { mode } }));
    }
  };

  return (
    <TextModeContext.Provider value={{ textMode, setTextMode }}>
      {children}
    </TextModeContext.Provider>
  );
}

export function useTextMode() {
  const context = useContext(TextModeContext);
  if (context === undefined) {
    throw new Error('useTextMode must be used within a TextModeProvider');
  }
  return context;
}

