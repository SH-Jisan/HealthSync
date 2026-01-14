// File: src/pages/dashboard/DiagnosticHome.tsx

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, MagnifyingGlass } from 'phosphor-react';
import DiagnosticSearch from '../../features/diagnostic/DiagnosticSearch';
import DiagnosticPatients, { type Patient } from '../../features/diagnostic/DiagnosticPatients';
import DiagnosticPatientView from '../../features/diagnostic/DiagnosticPatientView';
import DiagnosticPendingReports from '../../features/diagnostic/DiagnosticPendingReports.tsx';
import styles from './styles/DiagnosticHome.module.css';

export default function DiagnosticHome() {
    const { t } = useTranslation();

    // Tab State: 'assigned', 'pending', 'search'
    const [activeTab, setActiveTab] = useState('assigned');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // If a patient is selected, show detail view
    if (selectedPatient) {
        return (
            <DiagnosticPatientView
                patient={selectedPatient}
                onBack={() => setSelectedPatient(null)}
            />
        );
    }

    const tabs = [
        { id: 'assigned', label: t('dashboard.diagnostic.tabs.assigned'), Icon: Users },
        { id: 'pending', label: t('dashboard.diagnostic.tabs.pending'), Icon: FileText },
        { id: 'search', label: t('dashboard.diagnostic.tabs.search'), Icon: MagnifyingGlass },
    ];

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Tab Navigation with Sliding Pill */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activePill"
                                    className={styles.activePill}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className={styles.tabContent}>
                                <tab.Icon size={20} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Rendering based on Active Tab */}
            <div className={styles.contentArea}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'assigned' && (
                            <DiagnosticPatients onSelectPatient={setSelectedPatient} />
                        )}

                        {activeTab === 'pending' && (
                            <DiagnosticPendingReports onSelectPatient={setSelectedPatient} />
                        )}

                        {activeTab === 'search' && (
                            <DiagnosticSearch />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}