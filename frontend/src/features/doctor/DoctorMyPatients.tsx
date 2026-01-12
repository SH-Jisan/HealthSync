import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient.ts';
import { User, UserPlus, ArrowRight } from 'phosphor-react';
import styles from './styles/DoctorMyPatients.module.css';

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

    const fetchPatients = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchPatients();
    }, [fetchPatients]);

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
                await fetchPatients();
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            alert(message);
        }
    };

    if (loading) return <div>{t('dashboard.doctor.patients.loading')}</div>;

    return (
        <div>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('dashboard.doctor.patients.title')}</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={styles.addBtn}
                >
                    <UserPlus size={20} /> {t('dashboard.doctor.patients.add_btn')}
                </button>
            </div>

            {patients.length === 0 ? (
                <div className={styles.noPatients}>
                    {t('dashboard.doctor.patients.no_patients')}
                </div>
            ) : (
                <div className={styles.listGrid}>
                    {patients.map((row) => (
                        <div key={row.id} className={styles.card}>
                            <div className={styles.patientInfo}>
                                <div className={styles.avatar}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h4 className={styles.patientName}>{row.profiles?.full_name || 'Unknown'}</h4>
                                    <p className={styles.contactInfo}>{row.profiles?.phone || row.profiles?.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/dashboard/patient/${row.patient_id}`)}
                                className={styles.viewProfileBtn}
                            >
                                {t('dashboard.doctor.patients.view_profile')} <ArrowRight />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{t('dashboard.doctor.patients.add_modal_title')}</h3>
                        <p className={styles.modalDesc}>{t('dashboard.doctor.patients.add_modal_desc')}</p>
                        <input
                            placeholder={t('dashboard.doctor.patients.email_placeholder')}
                            value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                            className={styles.input}
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>{t('common.cancel')}</button>
                            <button onClick={addNewPatient} className={styles.saveBtn}>{t('dashboard.doctor.patients.add_action')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}