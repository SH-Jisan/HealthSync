import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient.ts';
import type { Appointment } from '../../types';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'phosphor-react';
import { format } from 'date-fns';
import styles from './styles/DoctorAppointments.module.css';

interface AppointmentWithPatient extends Appointment {
    profiles?: {
        full_name: string;
        phone: string;
        blood_group?: string;
    } | null;
}

export default function DoctorAppointments() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('appointments')
            .select('*, profiles:patient_id(full_name, phone, blood_group)')
            .eq('doctor_id', user.id)
            .order('appointment_date', { ascending: true });

        if (!error && data) {
            setAppointments(data as unknown as AppointmentWithPatient[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
        const { error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id);

        if (error) {
            alert(t('common.error'));
        } else {
            setAppointments(prev => prev.map(app =>
                app.id === id ? { ...app, status } : app
            ));
        }
    };

    if (loading) return <div>{t('dashboard.doctor.appointments.loading')}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('dashboard.doctor.appointments.title')}</h2>

            {appointments.length === 0 ? (
                <div className={styles.noAppointments}>
                    <h3>{t('dashboard.doctor.appointments.no_appointments')}</h3>
                </div>
            ) : (
                <div className={styles.listGrid}>
                    {appointments.map((app) => (
                        <div key={app.id} className={styles.card}>
                            <div className={styles.patientInfo}>
                                <div className={styles.avatar}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className={styles.patientName}>{app.profiles?.full_name || t('dashboard.doctor.appointments.unknown_patient')}</h3>
                                    <div className={styles.dateTime}>
                                        <span className={styles.iconText}>
                                            <Calendar size={16} />
                                            {format(new Date(app.appointment_date), 'dd MMM yyyy')}
                                        </span>
                                        <span className={styles.iconText}>
                                            <Clock size={16} />
                                            {format(new Date(app.appointment_date), 'hh:mm a')}
                                        </span>
                                    </div>
                                    {app.reason && <p className={styles.reason}>{t('dashboard.doctor.appointments.reason')} "{app.reason}"</p>}

                                    <button
                                        onClick={() => navigate(`/dashboard/patient/${app.patient_id}`)}
                                        className={styles.viewProfileBtn}
                                    >
                                        {t('dashboard.doctor.appointments.view_profile')}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                {app.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(app.id, 'CONFIRMED')}
                                            className={styles.acceptBtn}
                                        >
                                            <CheckCircle size={18} /> {t('dashboard.doctor.appointments.accept')}
                                        </button>
                                        <button
                                            onClick={() => updateStatus(app.id, 'CANCELLED')}
                                            className={styles.declineBtn}
                                        >
                                            <XCircle size={18} /> {t('dashboard.doctor.appointments.decline')}
                                        </button>
                                    </>
                                )}

                                {app.status === 'CONFIRMED' && (
                                    <span className={styles.statusConfirmed}>
                                        <CheckCircle size={20} weight="fill" /> {t('dashboard.doctor.appointments.confirmed')}
                                    </span>
                                )}

                                {app.status === 'CANCELLED' && (
                                    <span className={styles.statusCancelled}>
                                        <XCircle size={20} weight="fill" /> {t('dashboard.doctor.appointments.cancelled')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}