import { useState } from 'react';
import { X, Plus, Trash, Prescription, Pill, Clock, NotePencil, ArrowRight, Flask } from 'phosphor-react';
import { supabase } from '@/shared/lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/DoctorModals.module.css';

interface Props {
    patientId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface MedicineInput {
    id: string; // for list keys
    name: string;
    dosage: string;
    duration: string;
    instruction: string;
}

export default function PrescriptionModal({ patientId, onClose, onSuccess }: Props) {
    const { t } = useTranslation();
    const [medicines, setMedicines] = useState<MedicineInput[]>([
        { id: crypto.randomUUID(), name: '', dosage: '', duration: '', instruction: '' }
    ]);
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddRow = () => {
        setMedicines([...medicines, {
            id: crypto.randomUUID(),
            name: '',
            dosage: '',
            duration: '',
            instruction: ''
        }]);
    };

    const handleRemoveRow = (id: string) => {
        if (medicines.length === 1) return;
        setMedicines(medicines.filter(m => m.id !== id));
    };

    const handleChange = (id: string, field: keyof Omit<MedicineInput, 'id'>, value: string) => {
        setMedicines(medicines.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    const handleSubmit = async () => {
        if (medicines.some(m => !m.name)) return alert(t('dashboard.doctor.profile.validation_alert') || "Please enter medicine names.");

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Strip IDs before sending
        const cleanMedicines = medicines.map(m => ({
            name: m.name,
            dosage: m.dosage,
            duration: m.duration,
            instruction: m.instruction
        }));

        const { error } = await supabase.from('medical_events').insert({
            patient_id: patientId,
            uploader_id: user.id,
            title: 'Prescription',
            event_type: 'PRESCRIPTION',
            event_date: new Date().toISOString(),
            severity: 'LOW',
            summary: advice,
            medicines: cleanMedicines,
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
        <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className={styles.modal}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                <button onClick={onClose} className={styles.closeBtn}>
                    <X size={24} weight="bold" />
                </button>

                <h2>
                    <Prescription size={32} color="var(--primary)" weight="duotone" />
                    {t('dashboard.doctor.profile.new_prescription') || 'Write Prescription'}
                </h2>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>

                    <div className={styles.medicineList}>
                        <AnimatePresence initial={false}>
                            {medicines.map((med) => (
                                <motion.div
                                    key={med.id}
                                    className={styles.medicineRow}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                                    transition={{ duration: 0.3 }}
                                >

                                    {/* Name Input */}
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.mobileOnlyLabel}>Medicine Name</label>
                                        <div className={styles.inputIconWrapper}>
                                            <Pill size={20} className={styles.inputIcon} weight="duotone" />
                                            <input
                                                placeholder="Medicine Name (e.g. Napa)"
                                                value={med.name}
                                                onChange={(e) => handleChange(med.id, 'name', e.target.value)}
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                                autoFocus={medicines.length > 1 && medicines[medicines.length - 1].id === med.id}
                                            />
                                        </div>
                                    </div>

                                    {/* Dosage Input */}
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.mobileOnlyLabel}>Dosage</label>
                                        <div className={styles.inputIconWrapper}>
                                            <Flask size={20} className={styles.inputIcon} weight="duotone" />
                                            <input
                                                placeholder="1+0+1"
                                                value={med.dosage}
                                                onChange={(e) => handleChange(med.id, 'dosage', e.target.value)}
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Duration Input */}
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.mobileOnlyLabel}>Duration</label>
                                        <div className={styles.inputIconWrapper}>
                                            <Clock size={20} className={styles.inputIcon} weight="duotone" />
                                            <input
                                                placeholder="7 Days"
                                                value={med.duration}
                                                onChange={(e) => handleChange(med.id, 'duration', e.target.value)}
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Instruction Input */}
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.mobileOnlyLabel}>Note</label>
                                        <div className={styles.inputIconWrapper}>
                                            <NotePencil size={20} className={styles.inputIcon} weight="duotone" />
                                            <input
                                                placeholder="Note (e.g. After meal)"
                                                value={med.instruction}
                                                onChange={(e) => handleChange(med.id, 'instruction', e.target.value)}
                                                className={`${styles.input} ${styles.inputWithIcon}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    {medicines.length > 1 && (
                                        <button onClick={() => handleRemoveRow(med.id)} className={styles.removeBtn} title="Remove Medicine">
                                            <Trash size={18} weight="bold" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        onClick={handleAddRow}
                        className={styles.addBtn}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Plus size={18} weight="bold" /> Add Another Medicine
                    </motion.button>

                    {/* Advice Section */}
                    <div style={{ marginTop: '24px' }}>
                        <div className={styles.label}>
                            <NotePencil size={20} weight="duotone" />
                            {t('dashboard.doctor.profile.notes_label') || 'Medical Advice / Notes'}
                        </div>
                        <textarea
                            className={styles.textarea}
                            rows={4}
                            placeholder={t('dashboard.doctor.profile.notes_placeholder') || "Write advice for the patient..."}
                            value={advice}
                            onChange={(e) => setAdvice(e.target.value)}
                        />
                    </div>
                </div>

                <motion.button
                    onClick={handleSubmit}
                    className={styles.submitBtn}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? (
                        <>Sending Prescription...</>
                    ) : (
                        <>
                            {t('dashboard.doctor.profile.confirm_send') || 'Send Prescription'}
                            <ArrowRight size={20} weight="bold" />
                        </>
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}