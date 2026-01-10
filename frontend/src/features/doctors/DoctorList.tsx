import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
// Fix 1: Added 'type' keyword
import type { Doctor } from '../../types';
// Fix 2: Replaced 'Stethoscope' with 'FirstAid'
import { FirstAid, MagnifyingGlass, User } from 'phosphor-react';
import BookAppointmentModal from './BookAppointmentModal';

export default function DoctorList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpec, setSelectedSpec] = useState('All');
    const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

    const specialties = ['All', 'Cardiology', 'General Medicine', 'Neurology', 'Pediatrics', 'Dermatology'];

    // Fix 3: Moved fetchDoctors ABOVE useEffect
    const fetchDoctors = async () => {
        setLoading(true);
        let query = supabase.from('profiles').select('*').eq('role', 'DOCTOR');

        if (selectedSpec !== 'All') {
            query = query.eq('specialty', selectedSpec);
        }

        const { data, error } = await query;
        if (!error && data) setDoctors(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSpec]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--primary)' }}>Find a Specialist</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Book appointments with top doctors.</p>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem', justifyContent: 'center', flexWrap: 'wrap'
            }}>
                {specialties.map(spec => (
                    <button
                        key={spec}
                        onClick={() => setSelectedSpec(spec)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: '1px solid var(--primary)',
                            background: selectedSpec === spec ? 'var(--primary)' : 'transparent',
                            color: selectedSpec === spec ? 'white' : 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        {spec}
                    </button>
                ))}
            </div>

            {/* Doctor Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading Doctors...</div>
            ) : doctors.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
                    <MagnifyingGlass size={48} />
                    <p>No doctors found for this specialty.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem'
                }}>
                    {doctors.map(doc => (
                        <div key={doc.id} style={{
                            background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
                            boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                        }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%', background: '#E0F2F1', color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
                            }}>
                                <User size={40} />
                            </div>

                            <h3 style={{ margin: '0 0 5px 0' }}>{doc.full_name}</h3>
                            <span style={{
                                background: '#F1F5F9', color: 'var(--text-secondary)', padding: '4px 10px',
                                borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500
                            }}>
                {doc.specialty || 'General Physician'}
              </span>

                            <button
                                onClick={() => setBookingDoctor(doc)}
                                style={{
                                    marginTop: '1.5rem', width: '100%', padding: '10px',
                                    background: 'var(--primary)', color: 'white', border: 'none',
                                    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {/* Fix 2: Using FirstAid instead of Stethoscope */}
                                <FirstAid size={20} />
                                Book Appointment
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            {bookingDoctor && (
                <BookAppointmentModal
                    doctor={bookingDoctor}
                    onClose={() => setBookingDoctor(null)}
                />
            )}
        </div>
    );
}