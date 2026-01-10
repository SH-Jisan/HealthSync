import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { User, Trash } from 'phosphor-react';
import { format } from 'date-fns';

interface AssignedDoctor {
    id: string; // The ID in hospital_doctors table
    joined_at: string;
    doctor: {
        full_name: string;
        specialty: string | null;
        email: string;
    } | null;
}

export default function HospitalDoctors() {
    const [doctors, setDoctors] = useState<AssignedDoctor[]>([]);
    const [loading, setLoading] = useState(true);

    // Fix: Function defined BEFORE useEffect
    const fetchDoctors = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('hospital_doctors')
            .select('id, joined_at, doctor:doctor_id(full_name, specialty, email)')
            .eq('hospital_id', user.id);

        if (!error && data) {
            setDoctors(data as unknown as AssignedDoctor[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeDoctor = async (id: string) => {
        if (!confirm('Remove this doctor from your hospital?')) return;

        const { error } = await supabase
            .from('hospital_doctors')
            .delete()
            .eq('id', id);

        if (!error) {
            setDoctors(prev => prev.filter(d => d.id !== id));
        } else {
            alert('Failed to remove doctor.');
        }
    };

    if (loading) return <div>Loading Doctors...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Assigned Doctors</h2>

            {doctors.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '3rem' }}>
                    <p>No doctors assigned yet. Go to Overview to add doctors.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {doctors.map((item) => (
                        <div key={item.id} style={{
                            background: 'var(--surface)', padding: '1rem 1.5rem', borderRadius: '12px',
                            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '45px', height: '45px', borderRadius: '50%', background: '#E0F2F1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                                }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.doctor?.full_name || 'Unknown'}</h3>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {item.doctor?.specialty || 'General Physician'} • Joined {format(new Date(item.joined_at), 'MMM dd, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => removeDoctor(item.id)}
                                title="Remove Doctor"
                                style={{
                                    background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer'
                                }}
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}