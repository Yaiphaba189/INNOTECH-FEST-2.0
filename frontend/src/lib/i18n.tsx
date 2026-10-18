'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode } from '@/types';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    'app.title': 'HARVESTLINK AI',
    'app.subtitle': 'Predictive Crop Intelligence for Manipur',
    'farmer': 'Farmer',
    'buyer': 'Buyer',
    'fpo': 'FPO Logistics',
  },
};

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
