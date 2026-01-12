import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import TimelineView from '../timeline/TimelineView';
import { ArrowLeft, Plus, CheckCircle } from 'phosphor-react';
import styles from './styles/DoctorPatientProfile.module.css';

interface PatientProfile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    blood_group?: string;
    district?: string;
}

interface Test {
    id: string;
    name: string;
}

export default function DoctorPatientProfile() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [availableTests, setAvailableTests] = useState<Test[]>([]);
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchPatient = async () => {
        if (!id) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (data) setPatient(data as PatientProfile);
    };

    const fetchTests = async () => {
        const { data } = await supabase.from('available_tests').select('*').order('name');
        if (data) setAvailableTests(data as Test[]);
    };

    useEffect(() => {
        if (id) {
            fetchPatient();
            fetchTests();
        }
    }, [id]);

    const handlePrescribe = async () => {
        if (selectedTests.length === 0 && !notes) return alert(t('dashboard.doctor.profile.validation_alert') || 'Add tests or notes first.');
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const testsString = selectedTests.join(', ');

            const { error } = await supabase.from('medical_events').insert({
                patient_id: id,
                uploader_id: user?.id,
                title: selectedTests.length > 0 ? `Prescribed: ${selectedTests.length} Tests` : 'Doctor Advice',
                event_type: 'PRESCRIPTION',
                event_date: new Date().toISOString(),
                severity: 'MEDIUM',
                summary: `Tests: ${testsString}\nAdvice: ${notes}`,
                key_findings: selectedTests,
                extracted_text: `Doctor Notes:\n${notes}\n\nTests:\n${testsString}`
            });

            if (error) throw error;

            alert(t('dashboard.doctor.profile.success_alert') || 'Prescription Sent Successfully!');
            setNotes('');
            setSelectedTests([]);
            window.location.reload();

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('common.error');
            alert('Error: ' + message);
        } finally {
            setSaving(false);
        }
    };

    if (!patient) return <div>{t('dashboard.doctor.profile.loading')}</div>;

    return (
        <div className={styles.container}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
                <ArrowLeft size={20} /> {t('dashboard.doctor.profile.back')}
            </button>

            {/* Header */}
            <div className={styles.headerCard}>
                <div className={styles.avatar}>
                    {patient.full_name[0]}
                </div>
                <div className={styles.patientInfo}>
                    <h1>{patient.full_name}</h1>
                    <p className={styles.contactText}>{patient.phone || patient.email}</p>
                    <div className={styles.badges}>
                        <span className={styles.bloodBadge}>
                            Blood: {patient.blood_group || 'N/A'}
                        </span>
                        <span className={styles.locationBadge}>
                            {patient.district || 'Unknown Location'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.layoutGrid}>
                {/* Left: Timeline */}
                <div>
                    <TimelineView userId={id!} />
                </div>

                {/* Right: Prescription Form */}
                <div className={styles.formContainer}>
                    <div className={styles.formCard}>
                        <h3 className={styles.formTitle}>
                            <Plus size={20} /> {t('dashboard.doctor.profile.new_prescription')}
                        </h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('dashboard.doctor.profile.select_tests')}</label>
                            <div className={styles.testList}>
                                {availableTests.map(test => (
                                    <div key={test.id} className={styles.testItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedTests.includes(test.name)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedTests([...selectedTests, test.name]);
                                                else setSelectedTests(selectedTests.filter(t => t !== test.name));
                                            }}
                                        />
                                        <span>{test.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>{t('dashboard.doctor.profile.notes_label')}</label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('dashboard.doctor.profile.notes_placeholder')}
                                className={styles.textarea}
                            />
                        </div>

                        <button
                            onClick={handlePrescribe}
                            disabled={saving}
                            className={styles.submitBtn}
                        >
                            {saving ? t('dashboard.doctor.profile.sending') : <><CheckCircle size={20} /> {t('dashboard.doctor.profile.confirm_send')}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}