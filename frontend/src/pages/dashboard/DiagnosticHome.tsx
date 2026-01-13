// File: src/pages/dashboard/DiagnosticHome.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiagnosticSearch from '../../features/diagnostic/DiagnosticSearch';
import DiagnosticPatients, { type Patient } from '../../features/diagnostic/DiagnosticPatients';
import DiagnosticPatientView from '../../features/diagnostic/DiagnosticPatientView';
import DiagnosticPendingReports from '../../features/diagnostic/DiagnosticPendingReports.tsx'; // [New Import]
import styles from './styles/DiagnosticHome.module.css';

export default function DiagnosticHome() {
    const { t } = useTranslation();

    // Tab State: 'assigned', 'pending', 'search'
    const [activeTab, setActiveTab] = useState('assigned');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // যদি কোনো পেশেন্ট সিলেক্ট করা থাকে, তার ডিটেইল ভিউ দেখাবে
    if (selectedPatient) {
        return (
            <DiagnosticPatientView
                patient={selectedPatient}
                onBack={() => setSelectedPatient(null)}
            />
        );
    }

    return (
        <div className={styles.container}>
            {/* Tab Navigation */}
            <div className={styles.tabsContainer}>
                <button
                    onClick={() => setActiveTab('assigned')}
                    className={`${styles.tabButton} ${activeTab === 'assigned' ? styles.active : ''}`}
                >
                    {t('dashboard.diagnostic.tabs.assigned') || "Assigned"}
                </button>

                {/* [New Tab Button] */}
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`${styles.tabButton} ${activeTab === 'pending' ? styles.active : ''}`}
                >
                    {t('dashboard.diagnostic.tabs.pending') || "Pending Reports"}
                </button>

                <button
                    onClick={() => setActiveTab('search')}
                    className={`${styles.tabButton} ${activeTab === 'search' ? styles.active : ''}`}
                >
                    {t('dashboard.diagnostic.tabs.search') || "Search"}
                </button>
            </div>

            {/* Content Rendering based on Active Tab */}
            <div className={styles.contentArea}>
                {activeTab === 'assigned' && (
                    <DiagnosticPatients onSelectPatient={setSelectedPatient} />
                )}

                {/* [New Tab Content] */}
                {activeTab === 'pending' && (
                    <DiagnosticPendingReports onSelectPatient={setSelectedPatient} />
                )}

                {activeTab === 'search' && (
                    <DiagnosticSearch />
                )}
            </div>
        </div>
    );
}