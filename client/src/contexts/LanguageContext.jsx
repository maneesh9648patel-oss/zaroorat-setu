import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, availableLanguages } from '../data/translations';
import { ALL_INDIA_STATES, ALL_DIALECTS_LIST, INDIA_ZONES } from '../data/indiaLanguages';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('zaroorat_lang') || 'bnd'; // Default Bundeli for REC Banda pilot
  });

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('zaroorat_lang', language);
  }, [language]);

  // Find exact dialect metadata from Pan-India catalog
  const currentDialect = ALL_DIALECTS_LIST.find(d => d.code === language) || 
    ALL_DIALECTS_LIST.find(d => d.code === 'bnd') || {
      code: 'bnd',
      name: 'बुंदेली (बांदा व बुंदेलखंड)',
      native: 'बुंदेली',
      dialect: 'Bundeli',
      speechLang: 'hi-IN',
      base: 'bnd',
      stateShortName: 'UP (Banda)'
    };

  const currentSpeechLang = currentDialect.speechLang || 'hi-IN';

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  const selectLanguage = (code) => {
    setLanguage(code);
    setIsLangModalOpen(false);
  };

  const t = (key) => {
    // 1. Check direct dialect base translation pack (e.g. bnd, awa, bho, mr, gu, ta, etc.)
    const baseCode = currentDialect.base || language;
    if (translations[baseCode] && translations[baseCode][key]) {
      return translations[baseCode][key];
    }
    // 2. Check direct language code
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    // 3. Fallback to Hindi, then English, then raw key
    return translations['hi']?.[key] || translations['en']?.[key] || key;
  };

  const currentLangObj = {
    code: currentDialect.code,
    name: currentDialect.name,
    label: currentDialect.native || currentDialect.dialect || 'भाषा',
    region: currentDialect.stateShortName || 'REC Banda',
    speechLang: currentSpeechLang
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      currentDialect,
      currentSpeechLang,
      toggleLanguage, 
      selectLanguage, 
      availableLanguages,
      currentLangObj,
      allIndiaStates: ALL_INDIA_STATES,
      allDialects: ALL_DIALECTS_LIST,
      indiaZones: INDIA_ZONES,
      isLangModalOpen,
      setIsLangModalOpen,
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
