/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabaseClient';
import {
    Sun,
    Drop,
    Info,
    Moon,
    User,
    Bell,
    SignOut,
    FirstAid,
    SquaresFour,
    Translate,
} from 'phosphor-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { changeLanguage } = useLanguage(); // 🔥 Context-based language switch

    const [user, setUser] = useState<any>(null);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        setIsDark(document.body.classList.contains('dark-theme'));
    }, []);

    // 🌙 Theme Toggle
    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.body.classList.toggle('dark-theme', next);
    };

    // 🌐 Language Toggle (Context-driven)
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'bn' : 'en';
        changeLanguage(newLang); // 🔥 single source of truth
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const menuItems = [
        { key: 'dashboard', icon: <SquaresFour size={24} />, path: '/dashboard' },
        { key: 'blood', icon: <Drop size={24} color="#EF4444" />, path: '/blood' },
        { key: 'about', icon: <Info size={24} color="#60A5FA" />, path: '/about' },
        { key: 'profile', icon: <User size={24} />, path: '/profile' },
        { key: 'doctors', icon: <FirstAid size={24} />, path: '/doctors' },
    ];

    return (
        <aside className={styles.sidebar}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={styles.userInfo}>
                    <h3>{user?.user_metadata?.full_name || 'User'}</h3>
                    <p>{user?.email}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <div
                        key={item.key}
                        className={`${styles.navItem} ${
                            location.pathname === item.path ? styles.active : ''
                        }`}
                        onClick={() => {
                            navigate(item.path);
                            if (onClose) onClose();
                        }}
                    >
                        {item.icon}
                        <span>{t(`menu.${item.key}`)}</span>
                    </div>
                ))}

                <div className={styles.divider} />

                <NavLink
                    to="/notifications"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                    onClick={onClose}
                >
                    <Bell size={22} weight="bold" />
                    <span>{t('menu.notifications')}</span>
                </NavLink>

                {/* 🌙 Dark Mode */}
                <div className={styles.navItem} onClick={toggleTheme}>
                    {isDark ? <Moon size={24} color="#F59E0B" /> : <Sun size={24} />}
                    <span>{isDark ? t('common.dark_mode') : t('common.light_mode')}</span>
                </div>
            </nav>

            {/* 🌐 Language Switcher */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                    onClick={toggleLanguage}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                    }}
                >
                    <Translate size={24} color="var(--primary)" />
                    <span style={{ fontWeight: 600 }}>
            {t('common.switch_lang')}
          </span>
                </button>
            </div>

            {/* Logout */}
            <div className={styles.footer}>
                <div className={`${styles.navItem} ${styles.logout}`} onClick={handleLogout}>
                    <SignOut size={24} />
                    <span>{t('common.logout')}</span>
                </div>
            </div>
        </aside>
    );
}
