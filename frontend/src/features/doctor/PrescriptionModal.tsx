import { useState } from 'react';
import { X, Plus, Trash, Prescription, Pill, Clock, NotePencil, ArrowRight } from 'phosphor-react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import styles from './styles/DoctorModals.module.css';

interface Props {
    patientId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface MedicineInput {
    name: string;
    dosage: string;
    duration: string;
    instruction: string;
}

export default function PrescriptionModal({ patientId, onClose, onSuccess }: Props) {
    const { t } = useTranslation();
    const [medicines, setMedicines] = useState<MedicineInput[]>([
        { name: '', dosage: '', duration: '', instruction: '' }
    ]);
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddRow = () => {
        setMedicines([...medicines, { name: '', dosage: '', duration: '', instruction: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        const list = [...medicines];
        list.splice(index, 1);
        setMedicines(list);
    };

    const handleChange = (index: number, field: keyof MedicineInput, value: string) => {
        const list = [...medicines];
        list[index][field] = value;
        setMedicines(list);
    };

    const handleSubmit = async () => {
        if (medicines.some(m => !m.name)) return alert(t('dashboard.doctor.profile.validation_alert') || "Please enter medicine names.");

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('medical_events').insert({
            patient_id: patientId,
            uploader_id: user.id,
            title: 'Prescription',
            event_type: 'PRESCRIPTION',
            event_date: new Date().toISOString(),
            severity: 'LOW',
            summary: advice,
            medicines: medicines,
            key_findings: []
        });

        setLoading(false);
        if (error) {
            console.error(error);
            alert('Failed to save prescription.');
        } else {
            alert(t('dashboard.doctor.profile.success_alert') || 'Prescription sent successfully!');
            onSuccess();
            onClose();
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeBtn}>
                    <X size={24} />
                </button>

                <h2>
                    <Prescription size={32} color="var(--primary)" weight="duotone" style={{ verticalAlign: 'middle', marginRight: '12px' }} />
                    {t('dashboard.doctor.profile.new_prescription') || 'Write Prescription'}
                </h2>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>

                    {/* Medicine List */}
                    {medicines.map((med, index) => (
                        <div key={index} className={styles.medicineRow}>

                            {/* Name Input */}
                            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.mobileOnlyLabel}>Medicine Name</label>
                                <div className={styles.inputIconWrapper}>
                                    <Pill size={20} className={styles.inputIcon} />
                                    <input
                                        placeholder="Name (e.g. Napa)"
                                        value={med.name}
                                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                    />
                                </div>
                            </div>

                            {/* Dosage Input */}
                            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.mobileOnlyLabel}>Dosage</label>
                                <input
                                    placeholder="1+0+1"
                                    value={med.dosage}
                                    onChange={(e) => handleChange(index, 'dosage', e.target.value)}
                                    className={`${styles.input}`}
                                    style={{ textAlign: 'center' }}
                                />
                            </div>

                            {/* Duration Input */}
                            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.mobileOnlyLabel}>Duration</label>
                                <div className={styles.inputIconWrapper}>
                                    <Clock size={20} className={styles.inputIcon} />
                                    <input
                                        placeholder="7 Days"
                                        value={med.duration}
                                        onChange={(e) => handleChange(index, 'duration', e.target.value)}
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                    />
                                </div>
                            </div>

                            {/* Instruction Input */}
                            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.mobileOnlyLabel}>Note</label>
                                <div className={styles.inputIconWrapper}>
                                    <NotePencil size={20} className={styles.inputIcon} />
                                    <input
                                        placeholder="After meal"
                                        value={med.instruction}
                                        onChange={(e) => handleChange(index, 'instruction', e.target.value)}
                                        className={`${styles.input} ${styles.inputWithIcon}`}
                                    />
                                </div>
                            </div>

                            {/* Remove Button */}
                            {medicines.length > 1 && (
                                <button onClick={() => handleRemoveRow(index)} className={styles.removeBtn} title="Remove Medicine">
                                    <Trash size={18} />
                                </button>
                            )}
                        </div>
                    ))}

                    <button onClick={handleAddRow} className={styles.addBtn}>
                        <Plus size={18} weight="bold" /> Add Another Medicine
                    </button>

                    {/* Advice Section */}
                    <div style={{ marginTop: '24px' }}>
                        <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <NotePencil size={20} />
                            {t('dashboard.doctor.profile.notes_label') || 'Medical Advice / Notes'}
                        </label>
                        <textarea
                            className={styles.textarea}
                            rows={4}
                            placeholder={t('dashboard.doctor.profile.notes_placeholder') || "Write advice for the patient..."}
                            value={advice}
                            onChange={(e) => setAdvice(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className={styles.submitBtn}
                    disabled={loading}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loading ? (
                            <>Sending...</>
                        ) : (
                            <>
                                {t('dashboard.doctor.profile.confirm_send') || 'Send Prescription'}
                                <ArrowRight size={20} weight="bold" />
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}