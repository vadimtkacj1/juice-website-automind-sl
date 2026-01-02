'use client';

import { useEffect } from 'react';
import { useTextMode } from '@/lib/text-mode-context';

export default function KeyboardShortcuts() {
  const { setTextMode } = useTextMode();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contenteditable element
      const target = event.target as HTMLElement;
      const isInputElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable ||
        target.closest('input, textarea, [contenteditable]');

      // Don't trigger shortcuts when typing in inputs
      if (isInputElement) return;

      // Press "1" or ArrowUp to switch to Hebrew
      if (event.key === '1' || event.key === 'ArrowUp') {
        event.preventDefault();
        setTextMode('hebrew');
      }
      
      // Press "2" or ArrowDown to switch to English
      if (event.key === '2' || event.key === 'ArrowDown') {
        event.preventDefault();
        setTextMode('english');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [setTextMode]);

  return null; // This component doesn't render anything
}

