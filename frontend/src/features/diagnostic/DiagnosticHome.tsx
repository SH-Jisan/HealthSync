import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiagnosticSearch from './DiagnosticSearch';
import DiagnosticPatients from './DiagnosticPatients';
import DiagnosticPatientView from './DiagnosticPatientView';

export default function DiagnosticHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('assigned');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    if (selectedPatient) {
        return <DiagnosticPatientView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '2rem' }}>
                {['assigned', 'search'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                            textTransform: 'capitalize'
                        }}
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