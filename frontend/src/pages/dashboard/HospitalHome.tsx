import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HospitalOverview from '../../features/hospital/HospitalOverview.tsx';
import HospitalDoctors from '../../features/hospital/HospitalDoctors.tsx';
import HospitalPatients from '../../features/hospital/HospitalPatients.tsx';
import HospitalBloodBank from "../../features/hospital/HospitalBloodBank.tsx";
import styles from './styles/HospitalHome.module.css';

export default function HospitalHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'blood'>('overview');

    return (
        <div>
            {/* Tab Navigation */}
            <div className={styles.tabsContainer}>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
                >
                    {t('dashboard.hospital.tabs.overview')}
                </button>
                <button
                    onClick={() => setActiveTab('doctors')}
                    className={`${styles.tabButton} ${activeTab === 'doctors' ? styles.active : ''}`}
                >
                    {t('dashboard.hospital.tabs.doctors')}
                </button>
                <button
                    onClick={() => setActiveTab('patients')}
                    className={`${styles.tabButton} ${activeTab === 'patients' ? styles.active : ''}`}
                >
                    {t('dashboard.hospital.tabs.patients')}
                </button>
                <button
                    onClick={() => setActiveTab('blood')}
                    className={`${styles.tabButton} ${activeTab === 'blood' ? styles.active : ''}`}
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