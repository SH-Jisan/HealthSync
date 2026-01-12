import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppWindow, Users, CalendarCheck, User } from 'phosphor-react';
import DoctorAppointments from '../../features/doctor/DoctorAppointments';
import DoctorMyPatients from '../../features/doctor/DoctorMyPatients';
import DoctorChambers from '../../features/doctor/DoctorChambers';
import styles from './styles/DoctorHome.module.css';

export default function DoctorHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'chambers'>('appointments');

    return (
        <div>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <User weight="bold" /> {t('dashboard.doctor.title', 'Doctor Dashboard')}
                </h1>
                <p className={styles.subtitle}>
                    {t('dashboard.doctor.subtitle', 'Manage your appointments, patients, and chambers.')}
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabsContainer}>
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`${styles.tabButton} ${activeTab === 'appointments' ? styles.activeTab : ''}`}
                >
                    <CalendarCheck size={20} weight={activeTab === 'appointments' ? 'fill' : 'regular'} />
                    {t('dashboard.doctor.tabs.appointments', 'Appointments')}
                </button>
                <button
                    onClick={() => setActiveTab('patients')}
                    className={`${styles.tabButton} ${activeTab === 'patients' ? styles.activeTab : ''}`}
                >
                    <Users size={20} weight={activeTab === 'patients' ? 'fill' : 'regular'} />
                    {t('dashboard.doctor.tabs.patients', 'My Patients')}
                </button>
                <button
                    onClick={() => setActiveTab('chambers')}
                    className={`${styles.tabButton} ${activeTab === 'chambers' ? styles.activeTab : ''}`}
                >
                    <AppWindow size={20} weight={activeTab === 'chambers' ? 'fill' : 'regular'} />
                    {t('dashboard.doctor.tabs.chambers', 'Manage Chambers')}
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
                {activeTab === 'appointments' && <DoctorAppointments />}
                {activeTab === 'patients' && <DoctorMyPatients />}
                {activeTab === 'chambers' && <DoctorChambers />}
            </div>
        </div>
    );
}