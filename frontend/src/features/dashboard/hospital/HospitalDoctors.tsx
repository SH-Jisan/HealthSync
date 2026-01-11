import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient.ts';
import { User, Plus, Trash } from 'phosphor-react';

interface DoctorRow {
    id: string; // The relationship ID
    doctor_id: string;
    profiles: {
        full_name: string;
        specialty?: string;
    };
}

export default function HospitalDoctors() {
    const { t } = useTranslation();
    const [doctors, setDoctors] = useState<DoctorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');

    const fetchDoctors = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('hospital_doctors')
            .select('id, doctor_id, profiles:doctor_id(full_name, specialty)')
            .eq('hospital_id', user.id);

        if (data) setDoctors(data as unknown as DoctorRow[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const addDoctor = async () => {
        if (!searchEmail) return;

        try {
            // 1. Find Doctor by Email
            const { data: doctorProfile } = await supabase.from('profiles').select('id').eq('email', searchEmail).single();
            if (!doctorProfile) return alert(t('common.error'));

            // 2. Add to Hospital
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('hospital_doctors').insert({
                hospital_id: user?.id,
                doctor_id: doctorProfile.id
            });

            alert(t('common.success'));
            setShowModal(false);
            setSearchEmail('');
            fetchDoctors();
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    const removeDoctor = async (id: string) => {
        if (!confirm(t('dashboard.hospital.doctors.remove_confirm'))) return;
        await supabase.from('hospital_doctors').delete().eq('id', id);
        setDoctors(prev => prev.filter(d => d.id !== id));
    };

    if (loading) return <div>{t('dashboard.hospital.doctors.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('dashboard.hospital.doctors.title')}</h2>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)',
                        color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    <Plus size={20} /> {t('dashboard.hospital.doctors.add_new')}
                </button>
            </div>

            {doctors.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                    {t('dashboard.hospital.doctors.no_doctors')}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {doctors.map(d => (
                        <div key={d.id} style={{
                            background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
                            border: '1px solid var(--border)', position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem'
                        }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%', background: '#EFF6FF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB'
                            }}>
                                <User size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{d.profiles?.full_name}</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{d.profiles?.specialty}</p>
                            </div>

                            <button
                                onClick={() => removeDoctor(d.id)}
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
                        <h3>{t('dashboard.hospital.doctors.add_modal_title')}</h3>
                        <input
                            placeholder={t('dashboard.hospital.doctors.email_placeholder')}
                            value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('common.cancel')}</button>
                            <button onClick={addDoctor} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('dashboard.hospital.doctors.add_new')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}