import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient.ts';
import { Buildings, Plus, Trash, Clock } from 'phosphor-react';
import styles from './styles/DoctorChambers.module.css';

interface Hospital {
    id: string;
    hospital_name: string;
    visiting_hours: string;
}

export default function DoctorChambers() {
    const { t } = useTranslation();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [name, setName] = useState('');
    const [hours, setHours] = useState('');

    const fetchHospitals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('doctor_hospitals')
            .select('*')
            .eq('doctor_id', user.id);

        if (data) setHospitals(data as Hospital[]);
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchHospitals();
    }, []);

    const addHospital = async () => {
        if (!name || !hours) return alert(t('common.error'));

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('doctor_hospitals').insert({
            doctor_id: user.id,
            hospital_name: name,
            visiting_hours: hours
        });

        if (error) {
            alert(t('common.error'));
        } else {
            setShowModal(false);
            setName('');
            setHours('');
            fetchHospitals();
        }
    };

    const deleteHospital = async (id: string) => {
        if (!confirm(t('dashboard.doctor.chambers.delete_confirm'))) return;
        await supabase.from('doctor_hospitals').delete().eq('id', id);
        setHospitals(prev => prev.filter(h => h.id !== id));
    };

    if (loading) return <div>{t('dashboard.doctor.chambers.loading')}</div>;

    return (
        <div>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('dashboard.doctor.chambers.title')}</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className={styles.addBtn}
                >
                    <Plus size={20} /> {t('dashboard.doctor.chambers.add_btn')}
                </button>
            </div>

            {hospitals.length === 0 ? (
                <div className={styles.noChambers}>
                    {t('dashboard.doctor.chambers.no_chambers')}
                </div>
            ) : (
                <div className={styles.chamberGrid}>
                    {hospitals.map(h => (
                        <div key={h.id} className={styles.chamberCard}>
                            <div className={styles.chamberHeader}>
                                <Buildings size={24} color="var(--primary)" />
                                <h3 className={styles.chamberName}>{h.hospital_name}</h3>
                            </div>
                            <div className={styles.visitingHours}>
                                <Clock size={16} />
                                {h.visiting_hours}
                            </div>

                            <button
                                onClick={() => deleteHospital(h.id)}
                                className={styles.deleteBtn}
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{t('dashboard.doctor.chambers.modal_title')}</h3>
                        <input
                            placeholder={t('dashboard.doctor.chambers.name_placeholder')}
                            value={name} onChange={e => setName(e.target.value)}
                            className={styles.input}
                        />
                        <input
                            placeholder={t('dashboard.doctor.chambers.hours_placeholder')}
                            value={hours} onChange={e => setHours(e.target.value)}
                            className={styles.input}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowModal(false)} className={styles.cancelBtn}>{t('common.cancel')}</button>
                            <button onClick={addHospital} className={styles.saveBtn}>{t('common.save') || 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}