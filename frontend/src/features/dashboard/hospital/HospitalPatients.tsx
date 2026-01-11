import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { User, Calendar, ArrowRight, ArrowLeft } from 'phosphor-react';
import { format } from 'date-fns';
import TimelineView from '../../timeline/TimelineView';

interface HospitalAppointment {
    id: string;
    appointment_date: string;
    doctor: {
        full_name: string;
    };
    profiles: {
        id: string;
        full_name: string;
        phone: string;
        blood_group?: string;
    };
}

export default function HospitalPatients() {
    const [appointments, setAppointments] = useState<HospitalAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch appointments linked to this hospital
        // Assuming 'appointments' table has 'hospital_id' or we filter by doctors.
        // Based on your Flutter code, it seems direct.

        const { data, error } = await supabase
            .from('appointments')
            .select(`
        id, 
        appointment_date,
        doctor:doctor_id(full_name),
        profiles:patient_id(id, full_name, phone, blood_group)
      `)
            .eq('hospital_id', user.id) // Filter by Hospital ID
            .order('appointment_date', { ascending: false });

        if (!error && data) {
            setAppointments(data as unknown as HospitalAppointment[]);
        }
        setLoading(false);
    };

    if (selectedPatientId) {
        return (
            <div>
                <button
                    onClick={() => setSelectedPatientId(null)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
                        cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 600
                    }}
                >
                    <ArrowLeft size={20} /> Back to Patient List
                </button>
                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary)' }}>Patient Medical History</h2>
                </div>
                <TimelineView userId={selectedPatientId} />
            </div>
        );
    }

    if (loading) return <div>Loading Patients...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Admitted / Appointment Patients</h2>

            {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                    No patient records found for this hospital.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {appointments.map((apt) => (
                        <div key={apt.id} style={{
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
                                    <h3 style={{ margin: '0 0 5px 0' }}>{apt.profiles.full_name}</h3>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        Patient ID: {apt.profiles.phone || 'N/A'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500, color: '#0F172A' }}>
                                        Ref: Dr. {apt.doctor?.full_name || 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', justifyContent: 'flex-end' }}>
                                    <Calendar size={16} />
                                    {format(new Date(apt.appointment_date), 'dd MMM yyyy, hh:mm a')}
                                </div>
                                <button
                                    onClick={() => setSelectedPatientId(apt.profiles.id)}
                                    style={{
                                        padding: '8px 16px', background: 'var(--primary)', color: 'white',
                                        border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 600,
                                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    View History <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}