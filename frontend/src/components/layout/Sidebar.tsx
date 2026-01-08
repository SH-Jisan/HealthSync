// src/components/layout/Sidebar.tsx
/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    SquaresFour,      // Dashboard Icon
    Drop,            // Blood Icon
    Info,           // About Icon
    Moon,          // Dark Mode Icon
    Sun,          // Light Mode Icon
    SignOut,     // Logout Icon
    User,       // User Icon
} from 'phosphor-react';
import styles from './Sidebar.module.css'; // আমরা নিচে CSS ফাইল বানাবো

export default function Sidebar({ onClose } : {onClose?: () => void}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [isDark, setIsDark] = useState(false);

    // ইউজার ডাটা লোড করা
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        // ডার্ক মোড চেক করা
        const isDarkMode = document.body.classList.contains('dark-theme');
        setIsDark(isDarkMode);
    }, []);

    // থিম চেঞ্জ ফাংশন
    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.body.classList.toggle('dark-theme', newTheme);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const menuItems = [
        {
            name: 'Dashboard',
            icon: <SquaresFour size={24} />,
            path: '/dashboard'
        },
        {
            name: 'Blood Bank',
            icon: <Drop size={24} color="#EF4444" />,
            path: '/blood'
        }, // Red color for blood
        {
            name: 'About App',
            icon: <Info size={24} color="#60A5FA" />,
            path: '/about' },
        {
            name: 'Profile',
            icon: <User size={24} />,
            path: '/profile'
        },
    ];

    return (
        <aside className={styles.sidebar}>
            {/* Header with Gradient */}
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={styles.userInfo}>
                    <h3>{user?.user_metadata?.full_name || 'User'}</h3>
                    <p>{user?.email}</p>
                </div>
            </div>

            {/* Menu Items */}
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
                        onClick={() =>{
                            navigate(item.path);
                            if (onClose) onClose();
                        }}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </div>
                ))}

                <div className={styles.divider} />

                {/* Dark Mode Switch */}
                <div className={styles.navItem} onClick={toggleTheme}>
                    {isDark ? <Moon size={24} color="#F59E0B" /> : <Sun size={24} />}
                    <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
            </nav>

            {/* Logout Button */}
            <div className={styles.footer}>
                <div className={`${styles.navItem} ${styles.logout}`} onClick={handleLogout}>
                    <SignOut size={24} />
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
}