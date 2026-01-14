import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Sparkle, Syringe, MapPin, Ticket, PaperPlaneRight, CaretDown } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/RequestBlood.module.css';

export default function RequestBlood() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [aiPrompt, setAiPrompt] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showManual, setShowManual] = useState(true);

    // Form State
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [hospital, setHospital] = useState('');
    const [urgency, setUrgency] = useState<'NORMAL' | 'CRITICAL'>('NORMAL');
    const [note, setNote] = useState('');

    const handleAIAnalyze = async () => {
        if (!aiPrompt) return;
        setAnalyzing(true);
        try {
            const { data, error } = await supabase.functions.invoke('extract-blood-request', {
                body: { text: aiPrompt }
            });
            if (error) throw error;

            if (data) {
                if (data.blood_group) setBloodGroup(data.blood_group);
                if (data.location) setHospital(data.location);
                if (data.patient_note) setNote(data.patient_note);
                if (data.urgency) setUrgency(data.urgency);
                // Remove basic alert, could add toast notification here
            }
        } catch {
            alert(t('blood.request.ai_fail'));
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            await supabase.from('blood_requests').insert({
                requester_id: user.id,
                blood_group: bloodGroup,
                hospital_name: hospital,
                urgency: urgency,
                reason: note,
                status: 'OPEN'
            });

            await supabase.functions.invoke('notify-donors', {
                body: { blood_group: bloodGroup, hospital, urgency }
            });

            alert(t('blood.request.success'));
            navigate('/blood/feed');

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.mainCard} t-card-glass`}
            >
                <div className={styles.header}>
                    <div className={styles.iconCircle}>
                        <Syringe size={32} />
                    </div>
                    <h2 className={styles.title}>{t('blood.request.title')}</h2>
                    <p className={styles.subtitle}>{t('blood.request.subtitle', 'Fill in the details to find a donor nearby.')}</p>
                </div>

                {/* AI Section */}
                <div className={styles.aiSection}>
                    <div className={styles.aiHeader}>
                        <div className={styles.aiBadge}>
                            <Sparkle size={16} weight="fill" />
                            <span>AI ASSISTANT</span>
                        </div>
                        <h3>{t('blood.request.ai_title', 'Smart Autofill')}</h3>
                    </div>
                    <p className={styles.aiHelper}>{t('blood.request.ai_helper', 'Paste a message from WhatsApp or Facebook, and AI will fill the form for you.')}</p>
                    <div className={styles.aiInputWrapper}>
                        <textarea
                            placeholder={t('blood.request.ai_placeholder')}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={3}
                            className={styles.aiInput}
                        />
                        <button
                            onClick={handleAIAnalyze}
                            disabled={analyzing || !aiPrompt}
                            className={styles.aiButton}
                        >
                            {analyzing ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <>
                                    <Sparkle size={18} />
                                    {t('blood.request.autofill')}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className={styles.divider}>
                    <span>OR FILL MANUALLY</span>
                </div>

                {/* Manual Form */}
                <form onSubmit={handleSubmit} className={styles.formContent}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <Ticket size={18} />
                                {t('blood.request.group_label')}
                            </label>
                            <div className={styles.selectWrapper}>
                                <select
                                    value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                                    className={styles.select}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                <MapPin size={18} />
                                {t('blood.request.location_label')}
                            </label>
                            <input
                                type="text" required value={hospital} onChange={(e) => setHospital(e.target.value)}
                                className={styles.input}
                                placeholder="e.g. Dhaka Medical College"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t('blood.request.urgency_label')}</label>
                            <div className={styles.urgencyToggle}>
                                <button
                                    type="button"
                                    className={`${styles.urgencyBtn} ${urgency === 'NORMAL' ? styles.normalActive : ''}`}
                                    onClick={() => setUrgency('NORMAL')}
                                >
                                    {t('blood.request.normal')}
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.urgencyBtn} ${urgency === 'CRITICAL' ? styles.criticalActive : ''}`}
                                    onClick={() => setUrgency('CRITICAL')}
                                >
                                    {t('blood.request.critical')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>{t('blood.request.note_label')}</label>
                        <textarea
                            value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                            className={styles.textarea}
                            placeholder={t('blood.request.note_placeholder', 'Any specific instructions...')}
                        />
                    </div>

                    <button type="submit" disabled={loading} className={`${styles.submitBtn} t-btn-primary`}>
                        {loading ? 'Posting...' : (
                            <>
                                {t('blood.request.post_btn')}
                                <PaperPlaneRight size={20} weight="fill" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}