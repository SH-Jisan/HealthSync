import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { List } from 'phosphor-react';
import Sidebar from './Sidebar';
import styles from './Sidebar.module.css'; // স্টাইল এখান থেকেই ইমপোর্ট করছি
import { useTranslation } from 'react-i18next';

export default function DashboardLayout() {
    const { t } = useTranslation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className={styles.overlay + ' ' + styles.show}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Mobile এ ক্লাস দিয়ে কন্ট্রোল হবে */}
            <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <Sidebar onClose={() => setSidebarOpen(false)} /> {/* onClose prop নিচে যোগ করতে হবে */}
            </div>

            {/* Main Content */}
            <main style={{ flex: 1, width: '100%' }}>
                {/* Mobile Header with Menu Button */}
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            background: 'none', border: 'none', padding: '0.5rem',
                            marginRight: '1rem', display: 'flex'
                        }}
                        className="mobile-only" // CSS দিয়ে পিসিতে হাইড করতে হবে
                    >
                        <List size={28} color="var(--text-primary)" />
                    </button>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{t('common.health_sync')}</h2>
                </header>

                <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>

            {/* Responsive CSS for Main Layout */}
            <style>{`
        @media (min-width: 769px) {
          main { margin-left: var(--sidebar-width); }
          header { display: none !important; } /* পিসিতে হেডার লাগবে না */
        }
      `}</style>
        </div>
    );
}