import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiagnosticSearch from '../../features/diagnostic/DiagnosticSearch.tsx';
import DiagnosticPatients, { type Patient } from '../../features/diagnostic/DiagnosticPatients.tsx';
import DiagnosticPatientView from '../../features/diagnostic/DiagnosticPatientView.tsx';
import styles from './styles/DiagnosticHome.module.css';

export default function DiagnosticHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('assigned');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    if (selectedPatient) {
        return <DiagnosticPatientView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.tabsContainer}>
                {['assigned', 'search'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
                    >
                        {tab === 'assigned' ? t('dashboard.diagnostic.tabs.assigned') : t('dashboard.diagnostic.tabs.search')}
                    </button>
                ))}
            </div>

            {activeTab === 'assigned' ? (
                <DiagnosticPatients onSelectPatient={setSelectedPatient} />
            ) : (
                <DiagnosticSearch />
            )}
        </div>
    );
}