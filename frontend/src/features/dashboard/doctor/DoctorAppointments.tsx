import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient';
import type { Appointment } from '../../../types';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'phosphor-react';
import { format } from 'date-fns';

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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{t('dashboard.doctor.appointments.title')}</h2>

            {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                    <h3>{t('dashboard.doctor.appointments.no_appointments')}</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {appointments.map((app) => (
                        <div key={app.id} style={{
                            background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
                            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '50%', background: '#E0F2F1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                                }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>{app.profiles?.full_name || t('dashboard.doctor.appointments.unknown_patient')}</h3>
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Calendar size={16} />
                                            {format(new Date(app.appointment_date), 'dd MMM yyyy')}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Clock size={16} />
                                            {format(new Date(app.appointment_date), 'hh:mm a')}
                                        </span>
                                    </div>
                                    {app.reason && <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#64748B' }}>{t('dashboard.doctor.appointments.reason')} "{app.reason}"</p>}

                                    <button
                                        onClick={() => navigate(`/dashboard/patient/${app.patient_id}`)}
                                        style={{
                                            marginTop: '8px',
                                            background: 'none',
                                            border: '1px solid var(--primary)',
                                            color: 'var(--primary)',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        {t('dashboard.doctor.appointments.view_profile')}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {app.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(app.id, 'CONFIRMED')}
                                            style={{
                                                background: '#DCFCE7', color: '#166534', border: 'none', padding: '8px 16px', borderRadius: '8px',
                                                cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
                                            }}
                                        >
                                            <CheckCircle size={18} /> {t('dashboard.doctor.appointments.accept')}
                                        </button>
                                        <button
                                            onClick={() => updateStatus(app.id, 'CANCELLED')}
                                            style={{
                                                background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '8px 16px', borderRadius: '8px',
                                                cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
                                            }}
                                        >
                                            <XCircle size={18} /> {t('dashboard.doctor.appointments.decline')}
                                        </button>
                                    </>
                                )}

                                {app.status === 'CONFIRMED' && (
                                    <span style={{ color: '#16A34A', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle size={20} weight="fill" /> {t('dashboard.doctor.appointments.confirmed')}
                                    </span>
                                )}

                                {app.status === 'CANCELLED' && (
                                    <span style={{ color: '#DC2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
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