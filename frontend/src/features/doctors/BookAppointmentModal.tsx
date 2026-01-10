import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, CalendarCheck } from 'phosphor-react';
import type { Doctor } from '../../types';

interface Props {
    doctor: Doctor;
    onClose: () => void;
}

export default function BookAppointmentModal({ doctor, onClose }: Props) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please login first");

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

            alert(`Appointment request sent to Dr. ${doctor.full_name}!`);
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

                <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Book Appointment</h3>
                <p style={{ color: 'var(--text-secondary)' }}>with <strong>Dr. {doctor.full_name}</strong></p>

                <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Date</label>
                        <input
                            type="date" required
                            value={date} onChange={e => setDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Time</label>
                        <input
                            type="time" required
                            value={time} onChange={e => setTime(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Reason</label>
                        <textarea
                            rows={3} required
                            value={reason} onChange={e => setReason(e.target.value)}
                            placeholder="e.g. High fever for 2 days"
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
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
}