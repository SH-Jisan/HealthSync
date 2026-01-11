import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient.ts';
import { User, UserPlus, ArrowRight } from 'phosphor-react';

interface Patient {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
}

interface DoctorPatientRow {
    id: string; // ID of the relationship row
    patient_id: string;
    profiles: Patient; // Joined data
}

export default function DoctorMyPatients() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [patients, setPatients] = useState<DoctorPatientRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');

    const fetchPatients = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('doctor_patients')
            .select('id, patient_id, profiles:patient_id(id, full_name, email, phone)')
            .eq('doctor_id', user.id);

        if (!error && data) {
            setPatients(data as unknown as DoctorPatientRow[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const addNewPatient = async () => {
        if (!searchEmail) return;

        try {
            // 1. Find User
            const { data: profile, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', searchEmail)
                .single();

            if (searchError || !profile) {
                alert('User not found with this email.');
                return;
            }

            // 2. Add Relationship
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error: insertError } = await supabase.from('doctor_patients').insert({
                doctor_id: user.id,
                patient_id: profile.id
            });

            if (insertError) {
                if (insertError.code === '23505') alert('Patient is already in your list.');
                else alert('Failed to add patient.');
            } else {
                alert('Patient Added Successfully!');
                setShowAddModal(false);
                setSearchEmail('');
                fetchPatients();
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            alert(message);
        }
    };

    if (loading) return <div>{t('dashboard.doctor.patients.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('dashboard.doctor.patients.title')}</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)',
                        color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    <UserPlus size={20} /> {t('dashboard.doctor.patients.add_btn')}
                </button>
            </div>

            {patients.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                    {t('dashboard.doctor.patients.no_patients')}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {patients.map((row) => (
                        <div key={row.id} style={{
                            background: 'var(--surface)', padding: '1rem', borderRadius: '12px',
                            border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '45px', height: '45px', borderRadius: '50%', background: '#E0F2F1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                                }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>{row.profiles?.full_name || 'Unknown'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{row.profiles?.phone || row.profiles?.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/dashboard/patient/${row.patient_id}`)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px', background: 'none',
                                    border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer'
                                }}
                            >
                                {t('dashboard.doctor.patients.view_profile')} <ArrowRight />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px' }}>
                        <h3>{t('dashboard.doctor.patients.add_modal_title')}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('dashboard.doctor.patients.add_modal_desc')}</p>
                        <input
                            placeholder={t('dashboard.doctor.patients.email_placeholder')}
                            value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('common.cancel')}</button>
                            <button onClick={addNewPatient} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('dashboard.doctor.patients.add_action')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}