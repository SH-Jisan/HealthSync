import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient.ts';
import TimelineView from '../../timeline/TimelineView.tsx';
import { ArrowLeft, Plus, CheckCircle } from 'phosphor-react';

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

    // Moved functions ABOVE useEffect
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <ArrowLeft size={20} /> {t('dashboard.doctor.profile.back')}
            </button>

            {/* Header */}
            <div style={{
                background: 'var(--surface)', padding: '2rem', borderRadius: '16px',
                marginBottom: '2rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem'
            }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold'
                }}>
                    {patient.full_name[0]}
                </div>
                <div>
                    <h1 style={{ margin: 0 }}>{patient.full_name}</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{patient.phone || patient.email}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <span style={{ background: '#E0F2F1', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem' }}>
                            Blood: {patient.blood_group || 'N/A'}
                        </span>
                        <span style={{ background: '#F3E8FF', color: '#7E22CE', padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem' }}>
                            {patient.district || 'Unknown Location'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                {/* Left: Timeline */}
                <div>
                    <TimelineView userId={id} />
                </div>

                {/* Right: Prescription Form */}
                <div style={{ height: 'fit-content' }}>
                    <div style={{
                        background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px',
                        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '20px'
                    }}>
                        <h3 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={20} /> {t('dashboard.doctor.profile.new_prescription')}
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>{t('dashboard.doctor.profile.select_tests')}</label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
                                {availableTests.map(test => (
                                    <div key={test.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px' }}>
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

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>{t('dashboard.doctor.profile.notes_label')}</label>
                            <textarea
                                rows={4}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('dashboard.doctor.profile.notes_placeholder')}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <button
                            onClick={handlePrescribe}
                            disabled={saving}
                            style={{
                                width: '100%', padding: '12px', background: 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            {saving ? t('dashboard.doctor.profile.sending') : <><CheckCircle size={20} /> {t('dashboard.doctor.profile.confirm_send')}</>}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}