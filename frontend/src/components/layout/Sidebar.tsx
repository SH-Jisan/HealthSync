/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    Prescription // Import Prescription icon
} from 'phosphor-react';
import styles from './Sidebar.module.css';
import LanguageSwitcher from '../common/LanguageSwitcher';

// Update Props to include isOpen for mobile control
interface SidebarProps {
    onClose?: () => void;
    isOpen?: boolean;
}

export default function Sidebar({ onClose, isOpen = false }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const { t } = useTranslation();

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const menuItems = [
        { key: 'dashboard', icon: <SquaresFour size={24} />, path: '/dashboard' },
        ...((user?.user_metadata?.role === 'CITIZEN' || user?.user_metadata?.role === 'DOCTOR') ? [{
            key: 'prescriptions',
            icon: <Prescription size={24} />,
            path: '/prescriptions'
        }] : []),
        { key: 'blood', icon: <Drop size={24} color="#EF4444" />, path: '/blood' },
        { key: 'about', icon: <Info size={24} color="#60A5FA" />, path: '/about' },
        { key: 'profile', icon: <User size={24} />, path: '/profile' },
        { key: 'doctors', icon: <FirstAid size={24} />, path: '/doctors' },
    ];

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            {/* Header */}
            <div className={styles.header}>
                <span className={styles.welcomeLabel}>{t('common.welcome')}</span>
                <div className={styles.userCard}>
                    <div className={styles.avatar}>
                        {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className={styles.userInfo}>
                        <h3>{user?.user_metadata?.full_name || 'User'}</h3>
                        <p>{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <div
                        key={item.key}
                        className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''
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

                {/* Updates (Notifications) - Now part of main list */}
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

                <div className={styles.divider} />

                {/* Settings Group (Theme + Language) */}
                <div className={styles.settingsGroup}>
                    {/* 🌙 Dark Mode */}
                    <div className={styles.navItem} onClick={toggleTheme} style={{ justifyContent: 'center' }}>
                        {isDark ? <Moon size={24} color="#F59E0B" /> : <Sun size={24} />}
                    </div>

                    {/* 🌐 Language Switcher */}
                    <LanguageSwitcher style={{ width: '100%' }} />
                </div>
            </nav>

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