import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient.ts';
import { X, CalendarCheck } from 'phosphor-react';
import type { Doctor } from '../../../types';

interface Props {
    doctor: Doctor;
    onClose: () => void;
}

export default function BookAppointmentModal({ doctor, onClose }: Props) {
    const { t } = useTranslation();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error(t('book_appointment.login_error'));

            // Combine Date & Time
            const appointmentDateTime = new Date(`${date}T${time}`).toISOString();

            const { error } = await supabase.from('appointments').insert({
                doctor_id: doctor.id,
                patient_id: user.id,
                appointment_date: appointmentDateTime,
                reason: reason,
                status: 'PENDING'
            });

            if (error) throw error;

            alert(t('book_appointment.success', { name: doctor.full_name }));
            onClose();

        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '16px',
                width: '90%', maxWidth: '400px', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>{t('book_appointment.title')}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{t('book_appointment.with')} <strong>Dr. {doctor.full_name}</strong></p>

                <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('book_appointment.date')}</label>
                        <input
                            type="date" required
                            value={date} onChange={e => setDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('book_appointment.time')}</label>
                        <input
                            type="time" required
                            value={time} onChange={e => setTime(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('book_appointment.reason')}</label>
                        <textarea
                            rows={3} required
                            value={reason} onChange={e => setReason(e.target.value)}
                            placeholder={t('book_appointment.reason_placeholder')}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        style={{
                            background: 'var(--primary)', color: 'white', padding: '12px',
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <CalendarCheck size={20} />
                        {loading ? t('book_appointment.booking') : t('book_appointment.confirm_btn')}
                    </button>
                </form>
            </div>
        </div>
    );
}