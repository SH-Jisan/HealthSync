import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient.ts';
import { User, Plus, Trash } from 'phosphor-react';

interface PatientRow {
    id: string; // The relationship ID
    patient_id: string;
    admission_date: string;
    profiles: {
        full_name: string;
        email?: string;
        phone?: string;
    };
}

export default function HospitalPatients() {
    const { t } = useTranslation();
    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');

    const fetchPatients = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('hospital_patients')
            .select('id, patient_id, admission_date, profiles:patient_id(full_name, email, phone)')
            .eq('hospital_id', user.id);

        if (data) setPatients(data as unknown as PatientRow[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const admitPatient = async () => {
        if (!searchEmail) return;

        try {
            // 1. Find Patient
            const { data: patientProfile } = await supabase.from('profiles').select('id').eq('email', searchEmail).single();
            if (!patientProfile) return alert(t('common.error'));

            // 2. Admit
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('hospital_patients').insert({
                hospital_id: user?.id,
                patient_id: patientProfile.id,
                admission_date: new Date().toISOString()
            });

            alert(t('common.success'));
            setShowModal(false);
            setSearchEmail('');
            fetchPatients();
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    const dischargePatient = async (id: string) => {
        if (!confirm(t('dashboard.hospital.patients.discharge_confirm'))) return;
        await supabase.from('hospital_patients').delete().eq('id', id);
        setPatients(prev => prev.filter(p => p.id !== id));
    };

    if (loading) return <div>{t('dashboard.hospital.patients.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('dashboard.hospital.patients.title')}</h2>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)',
                        color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    <Plus size={20} /> {t('dashboard.hospital.patients.admit_new')}
                </button>
            </div>

            {patients.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                    {t('dashboard.hospital.patients.no_patients')}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {patients.map(p => (
                        <div key={p.id} style={{
                            background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
                            border: '1px solid var(--border)', position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem'
                        }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%', background: '#F0FDFA',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F766E'
                            }}>
                                <User size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{p.profiles?.full_name}</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.profiles?.phone || p.profiles?.email}</p>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Admitted: {new Date(p.admission_date).toLocaleDateString()}</span>
                            </div>

                            <button
                                onClick={() => dischargePatient(p.id)}
                                style={{
                                    position: 'absolute', top: '15px', right: '15px', background: '#FEE2E2',
                                    color: '#DC2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer'
                                }}
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px' }}>
                        <h3>{t('dashboard.hospital.patients.add_modal_title')}</h3>
                        <input
                            placeholder={t('dashboard.hospital.patients.email_placeholder')}
                            value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('common.cancel')}</button>
                            <button onClick={admitPatient} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('dashboard.hospital.patients.admit')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}