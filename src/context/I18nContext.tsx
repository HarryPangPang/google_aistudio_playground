import React, { createContext, useState, useContext, useEffect } from 'react';
import { zhCN, enUS } from '../locales';

type Language = 'zh-CN' | 'en-US';
type Translations = typeof zhCN;

// Helper function to access nested properties by dot notation
function getNestedValue(obj: any, path: string): string {
    let res = ''
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj) || path;
}

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
    $l: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
    language: 'zh-CN',
    setLanguage: () => {},
    t: zhCN,
    $l: (key: string) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('zh-CN');

    const t = language === 'zh-CN' ? zhCN : enUS;
    const $l = (key: string) => {
        const v = t[key]
        if (typeof v === 'string') {
            return v;
        }
        return getNestedValue(t, key);
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t, $l }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);
