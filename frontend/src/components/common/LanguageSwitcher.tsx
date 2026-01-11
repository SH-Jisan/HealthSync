import { useTranslation } from 'react-i18next';
import { Translate } from 'phosphor-react';
import { useLanguage } from '../../context/LanguageContext';

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
                className={className}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
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
                className={className}
                title={t('common.switch_lang')}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: '50%',
                }}
            >
                <Translate size={24} />
            </button>
        )
    }

    // Default 'button' style
    return (
        <button
            onClick={toggleLanguage}
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
                ...style,
            }}
        >
            <Translate size={20} color="var(--primary)" />
            {showLabel && (
                <span style={{ fontWeight: 600 }}>
                    {isEnglish ? 'বাংলা' : 'English'}
                </span>
            )}
        </button>
    );
}
