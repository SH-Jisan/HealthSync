import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleNotch } from 'phosphor-react';

interface LanguageContextType {
    changeLanguage: (lang: string) => void;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const { i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const changeLanguage = (lang: string) => {
        setIsLoading(true);
        // ১ সেকেন্ডের জন্য লোডার দেখাবে (Simulated Loading)
        setTimeout(() => {
            i18n.changeLanguage(lang);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <LanguageContext.Provider value={{ changeLanguage, isLoading }}>
            {/* Global Loader Overlay */}
            {isLoading && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.9)',
                    zIndex: 9999, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <CircleNotch size={64} color="var(--primary)" className="spin-animation" />
                    <h3 style={{ marginTop: '20px', color: 'var(--primary)' }}>
                        {i18n.language === 'en' ? 'ভাষা পরিবর্তন হচ্ছে...' : 'Switching Language...'}
                    </h3>
                    <style>{`
            .spin-animation { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
                </div>
            )}

            {/* Main Content */}
            <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};