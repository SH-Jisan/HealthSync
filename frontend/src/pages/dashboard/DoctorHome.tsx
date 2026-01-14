import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppWindow, Users, CalendarCheck } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import DoctorAppointments from '../../features/doctor/DoctorAppointments';
import DoctorMyPatients from '../../features/doctor/DoctorMyPatients';
import DoctorChambers from '../../features/doctor/DoctorChambers';
import styles from './styles/DoctorHome.module.css';

export default function DoctorHome() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'chambers'>('appointments');

    const tabs = [
        { id: 'appointments', label: t('dashboard.doctor.tabs.appointments', 'Appointments'), Icon: CalendarCheck },
        { id: 'patients', label: t('dashboard.doctor.tabs.patients', 'My Patients'), Icon: Users },
        { id: 'chambers', label: t('dashboard.doctor.tabs.chambers', 'Manage Chambers'), Icon: AppWindow },
    ] as const;

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
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="doctorActivePill"
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

            {/* Content Area */}
            <div className={styles.contentArea}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'appointments' && <DoctorAppointments />}
                        {activeTab === 'patients' && <DoctorMyPatients />}
                        {activeTab === 'chambers' && <DoctorChambers />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}