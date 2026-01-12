import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleNotch } from 'phosphor-react';
import styles from './LanguageContext.module.css';

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
                <div className={styles.overlay}>
                    <CircleNotch size={64} className={styles.spinner} />
                    <h3 className={styles.loadingText}>
                        {i18n.language === 'en' ? 'ভাষা পরিবর্তন হচ্ছে...' : 'Switching Language...'}
                    </h3>
                </div>
            )}

            {/* Main Content */}
            <div className={`${styles.content} ${isLoading ? styles.contentHidden : ''}`}>
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