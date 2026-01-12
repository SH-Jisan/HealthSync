import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import {
    Calendar, Clock, MapPin, CheckCircle, XCircle, Hourglass,
    Prescription as PrescriptionIcon, TestTube, Buildings, FileText
} from 'phosphor-react';
import { format } from 'date-fns';
import styles from './PatientAppointments.module.css';

// Types
interface Appointment {
    id: string;
    created_at: string;
    appointment_date: string;
    status: string;
    reason: string;
    doctor: { full_name: string; specialty: string };
    hospital?: { full_name: string; address: string };
}

interface Prescription {
    id: string;
    event_date: string;
    title: string;
    uploader: { full_name: string; specialty: string };
}

interface Diagnostic {
    id: string;
    created_at: string;
    report_status: string;
    provider: { full_name: string };
}

export default function PatientAppointments() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'diagnostic' | 'hospitals'>('appointments');
    const [loading, setLoading] = useState(true);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (activeTab === 'appointments') {
            const { data } = await supabase
                .from('appointments')
                .select('*, doctor:doctor_id(full_name, specialty), hospital:hospital_id(full_name, address)')
                .eq('patient_id', user.id)
                .order('appointment_date', { ascending: false });
            if (data) setAppointments(data as unknown as Appointment[]);
        }
        else if (activeTab === 'prescriptions') {
            const { data } = await supabase
                .from('medical_events')
                .select('*, uploader:uploader_id(full_name, specialty)')
                .eq('patient_id', user.id)
                .eq('event_type', 'PRESCRIPTION')
                .order('event_date', { ascending: false });
            if (data) setPrescriptions(data as unknown as Prescription[]);
        }
        else if (activeTab === 'diagnostic') {
            const { data } = await supabase
                .from('patient_payments')
                .select('*, provider:provider_id(full_name)')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false });
            if (data) setDiagnostics(data as unknown as Diagnostic[]);
        }

        setLoading(false);
    }, [activeTab]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return { className: styles.statusConfirmed, icon: <CheckCircle weight="fill" /> };
            case 'CANCELLED': return { className: styles.statusCancelled, icon: <XCircle weight="fill" /> };
            default: return { className: styles.statusPending, icon: <Hourglass weight="fill" /> };
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>{t('appointments.title')}</h2>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                {[
                    { id: 'appointments', label: t('appointments.tabs.appointments'), icon: <Calendar /> },
                    { id: 'prescriptions', label: t('appointments.tabs.prescriptions'), icon: <PrescriptionIcon /> },
                    { id: 'diagnostic', label: t('appointments.tabs.diagnostic'), icon: <TestTube /> },
                    { id: 'hospitals', label: t('appointments.tabs.hospitals'), icon: <Buildings /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>{t('appointments.loading')}</div>
            ) : (
                <>
                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className={styles.gridList}>
                            {appointments.length === 0 ? <EmptyState text={t('appointments.no_appointments')} /> : appointments.map(app => {
                                const { className } = getStatusInfo(app.status);
                                const dateObj = new Date(app.appointment_date);
                                return (
                                    <div key={app.id} className={styles.card}>
                                        <div className={styles.cardContent}>
                                            {/* Date Block */}
                                            <div className={styles.dateBlock}>
                                                <div className={styles.dateMonth}>{format(dateObj, 'MMM').toUpperCase()}</div>
                                                <div className={styles.dateDay}>{format(dateObj, 'dd')}</div>
                                            </div>

                                            <div className={styles.infoSection}>
                                                <div className={styles.mainTitle}>Dr. {app.doctor.full_name}</div>
                                                <div className={styles.subTitle}>{app.doctor.specialty}</div>

                                                <div className={styles.metaInfo}>
                                                    <span className={styles.metaItem}>
                                                        <Clock size={16} /> {format(dateObj, 'hh:mm a')}
                                                    </span>
                                                    {app.hospital && (
                                                        <span className={styles.metaItem}>
                                                            <MapPin size={16} /> {app.hospital.full_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span className={`${styles.statusBadge} ${className}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Prescriptions Tab */}
                    {activeTab === 'prescriptions' && (
                        <div className={styles.gridList}>
                            {prescriptions.length === 0 ? <EmptyState text={t('appointments.no_prescriptions')} /> : prescriptions.map(rx => (
                                <div key={rx.id} className={styles.card}>
                                    <div className={`${styles.cardContent} ${styles.cardContentCenter}`}>
                                        <div className={`${styles.iconWrapper} ${styles.prescriptionIcon}`}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div className={styles.mainTitle}>{rx.uploader.full_name}</div>
                                            <div className={styles.subTitle}>
                                                {t('appointments.date_label')} {format(new Date(rx.event_date), 'MMM dd, yyyy')}
                                            </div>
                                            <div style={{ marginTop: '4px', fontWeight: 500 }}>
                                                {t('appointments.rx_label')} {rx.title}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Diagnostic Tab */}
                    {activeTab === 'diagnostic' && (
                        <div className={styles.gridList}>
                            {diagnostics.length === 0 ? <EmptyState text={t('appointments.no_diagnostics')} /> : diagnostics.map(diag => (
                                <div key={diag.id} className={styles.card}>
                                    <div className={`${styles.cardContent} ${styles.cardContentCenter}`}>
                                        <div className={`${styles.iconWrapper} ${styles.diagnosticIcon}`}>
                                            <TestTube size={24} />
                                        </div>
                                        <div>
                                            <div className={styles.mainTitle}>{diag.provider.full_name}</div>
                                            <div className={styles.subTitle}>
                                                {t('appointments.date_label')} {format(new Date(diag.created_at), 'MMM dd, yyyy')}
                                            </div>
                                            <div style={{ marginTop: '4px' }}>{t('appointments.status_label')}
                                                <span className={`${styles.statusText} ${diag.report_status === 'COMPLETED' ? styles.statusCompleted : styles.statusPendingText}`}>
                                                    {diag.report_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hospitals Tab */}
                    {activeTab === 'hospitals' && <EmptyState text={t('appointments.no_hospitals')} />}
                </>
            )}
        </div>
    );
}

// Helper Components
function EmptyState({ text }: { text: string }) {
    return (
        <div className={styles.emptyState}>
            <Hourglass size={48} className={styles.emptyIcon} />
            <p>{text}</p>
        </div>
    );
}