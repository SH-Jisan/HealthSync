import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DoctorAppointments from './doctor/DoctorAppointments';
import DoctorChambers from './doctor/DoctorChambers';
import DoctorMyPatients from './doctor/DoctorMyPatients';

export default function DoctorHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'chambers'>('appointments');

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Header Panel */}
            <div style={{
                background: 'linear-gradient(to right, var(--primary), var(--primary-dark))',
                padding: '2rem', borderRadius: '16px', color: 'white', marginBottom: '2rem'
            }}>
                <h1 style={{ margin: 0 }}>{t('dashboard.doctor.title')}</h1>
                <p style={{ opacity: 0.9 }}>{t('dashboard.doctor.subtitle')}</p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem'
            }}>
                {[
                    { id: 'appointments', label: t('dashboard.doctor.tabs.appointments') },
                    { id: 'patients', label: t('dashboard.doctor.tabs.patients') },
                    { id: 'chambers', label: t('dashboard.doctor.tabs.chambers') },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: '1rem 0', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '1rem', fontWeight: 600,
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'appointments' && <DoctorAppointments />}
            {activeTab === 'patients' && <DoctorMyPatients />}
            {activeTab === 'chambers' && <DoctorChambers />}

        </div>
    );
}