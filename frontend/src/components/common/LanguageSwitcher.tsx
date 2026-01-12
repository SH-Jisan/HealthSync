import { useTranslation } from 'react-i18next';
import { Translate } from 'phosphor-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
    variant?: 'text' | 'button' | 'icon';
    className?: string;
    showLabel?: boolean;
    style?: React.CSSProperties;
}

export default function LanguageSwitcher({ variant = 'button', className = '', showLabel = true, style }: LanguageSwitcherProps) {
    const { i18n, t } = useTranslation();
    const { changeLanguage } = useLanguage();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'bn' : 'en';
        changeLanguage(newLang);
    };

    const isEnglish = i18n.language === 'en';

    if (variant === 'text') {
        return (
            <button
                onClick={toggleLanguage}
                className={`${styles.textVariant} ${className}`}
                style={style}
            >
                <Translate size={20} />
                {isEnglish ? 'বাংলা' : 'English'}
            </button>
        );
    }

    if (variant === 'icon') {
        return (
            <button
                onClick={toggleLanguage}
                className={`${styles.iconVariant} ${className}`}
                title={t('common.switch_lang')}
                style={style}
            >
                <Translate size={24} />
            </button>
        )
    }

    // Default 'button' style
    return (
        <button
            onClick={toggleLanguage}
            className={`${styles.buttonVariant} ${className}`}
            style={style}
        >
            <Translate size={20} color="var(--primary)" />
            {showLabel && (
                <span className={styles.label}>
                    {isEnglish ? 'বাংলা' : 'English'}
                </span>
            )}
        </button>
    );
}
