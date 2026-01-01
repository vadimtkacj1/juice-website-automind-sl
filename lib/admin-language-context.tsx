'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'he' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('he'); // Hebrew is default

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('admin-language') as Language;
    if (savedLanguage === 'he' || savedLanguage === 'en') {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('admin-language', lang);
  };

  // Translation function
  const t = (text: string): string => {
    if (!text) return '';
    
    // If language is English, return text as-is (assuming text is already in English)
    if (language === 'en') {
      return text;
    }
    
    // If language is Hebrew, translate using existing translation function
    // We'll import and use translateToHebrew
    const { translateToHebrew } = require('@/lib/translations');
    return translateToHebrew(text);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider');
  }
  return context;
}

