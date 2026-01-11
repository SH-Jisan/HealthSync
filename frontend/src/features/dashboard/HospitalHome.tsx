import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HospitalOverview from './hospital/HospitalOverview';
import HospitalDoctors from './hospital/HospitalDoctors';
import HospitalPatients from './hospital/HospitalPatients';
import HospitalBloodBank from "./hospital/HospitalBloodBank.tsx"; // <--- Import

export default function HospitalHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'blood'>('overview'); // <--- Updated State Type

    return (
        <div>
            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem'
            }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={getTabStyle(activeTab === 'overview')}
                >
                    {t('dashboard.hospital.tabs.overview')}
                </button>
                <button
                    onClick={() => setActiveTab('doctors')}
                    style={getTabStyle(activeTab === 'doctors')}
                >
                    {t('dashboard.hospital.tabs.doctors')}
                </button>
                <button
                    onClick={() => setActiveTab('patients')}
                    style={getTabStyle(activeTab === 'patients')}
                >
                    {t('dashboard.hospital.tabs.patients')}
                </button>
                <button
                    onClick={() => setActiveTab('blood')}
                    style={getTabStyle(activeTab === 'blood')}
                >
                    {t('dashboard.hospital.tabs.blood')}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <HospitalOverview />}
            {activeTab === 'doctors' && <HospitalDoctors />}
            {activeTab === 'patients' && <HospitalPatients />}
            {activeTab === 'blood' && <HospitalBloodBank />}
        </div>
    );
}

// Helper for clean styles
function getTabStyle(isActive: boolean) {
    return {
        padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '1rem', fontWeight: 600,
        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
        borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'all 0.2s'
    };
}