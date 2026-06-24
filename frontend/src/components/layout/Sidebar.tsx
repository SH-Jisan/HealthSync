/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/shared/lib/supabaseClient';
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
    Prescription,
    CalendarCheck,
    Clock
} from 'phosphor-react';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useTheme } from '@/app/providers/ThemeContext';

// Update Props to include isOpen for mobile control
interface SidebarProps {
    onClose?: () => void;
    isOpen?: boolean;
}

export default function Sidebar({ onClose, isOpen = false }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const menuItems = [
        { key: 'dashboard', icon: <SquaresFour size={24} />, path: '/dashboard' },
        ...((user?.user_metadata?.role === 'CITIZEN') ? [
            { key: 'appointments', icon: <CalendarCheck size={24} />, path: '/appointments' },
            // Removed History link as requested
        ] : []),
        ...((user?.user_metadata?.role === 'DOCTOR') ? [
            { key: 'citizen_view', icon: <User size={24} />, path: '/doctor/citizen-view' },
        ] : []),
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
                {menuItems.map((item) => {
                    const isActive = item.path === '/dashboard'
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path);

                    return (
                        <div
                            key={item.key}
                            className={`${styles.navItem} ${isActive ? styles.activeItem : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                if (onClose) onClose();
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className={styles.activePill}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={styles.navContent}>
                                {item.icon}
                                <span>{t(`menu.${item.key}`)}</span>
                            </span>
                        </div>
                    );
                })}

                {/* Updates (Notifications) */}
                <NavLink
                    to="/notifications"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.activeItem : ''}`
                    }
                    onClick={onClose}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className={styles.activePill}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={styles.navContent}>
                                <Bell size={22} weight="bold" />
                                <span>{t('menu.notifications')}</span>
                            </span>
                        </>
                    )}
                </NavLink>

                <div className={styles.divider} />

                {/* Settings Group (Theme + Language) */}
                <div className={styles.settingsGroup}>
                    {/* 🌙 Dark Mode */}
                    <div className={styles.navItem} onClick={toggleTheme} style={{ justifyContent: 'center' }}>
                        {theme === 'dark' ? <Moon size={24} color="#F59E0B" /> : <Sun size={24} />}
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