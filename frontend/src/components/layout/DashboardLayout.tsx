import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { List } from 'phosphor-react';
import Sidebar from './Sidebar';
import sidebarStyles from './Sidebar.module.css'; // সাইডবারের স্টাইল (overlay, sidebar animation)
import layoutStyles from './DashboardLayout.module.css'; // লেআউটের নতুন স্টাইল
import { useTranslation } from 'react-i18next';

export default function DashboardLayout() {
    const { t } = useTranslation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={layoutStyles.layoutContainer}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className={`${sidebarStyles.overlay} ${sidebarStyles.show}`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`${sidebarStyles.sidebar} ${isSidebarOpen ? sidebarStyles.open : ''}`}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <main className={layoutStyles.mainContent}>
                {/* Mobile Header */}
                <header className={layoutStyles.mobileHeader}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={layoutStyles.menuButton}
                    >
                        <List size={28} color="var(--text-primary)" />
                    </button>
                    <h2 className={layoutStyles.pageTitle}>{t('common.health_sync')}</h2>
                </header>

                <div className={layoutStyles.contentContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}