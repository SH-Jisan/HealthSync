import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Sparkle, Syringe, MapPin, Ticket, PaperPlaneRight, MagicWand, Phone, Heartbeat } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import styles from './styles/RequestBlood.module.css';

export default function RequestBlood() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [aiPrompt, setAiPrompt] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [hospital, setHospital] = useState('');
    const [contact, setContact] = useState('');
    const [urgency, setUrgency] = useState<'NORMAL' | 'CRITICAL'>('NORMAL');

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
                if (data.urgency) setUrgency(data.urgency);
                if (data.contact) setContact(data.contact);
            }
        } catch (error) {
            console.error(error);
            alert("AI Analysis failed. Please fill manually.");
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

            const { error } = await supabase.from('blood_requests').insert({
                requester_id: user.id,
                blood_group: bloodGroup,
                hospital_name: hospital,
                contact_number: contact,
                urgency: urgency,
                status: 'OPEN'
            });

            if (error) throw error;

            alert("Request posted successfully!");
            navigate('/blood/feed');

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className={styles.container}>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className={styles.mainCard}
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className={styles.header}>
                    <motion.div
                        className={styles.iconCircle}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Syringe size={32} weight="duotone" />
                    </motion.div>
                    <h2 className={styles.title}>{t('blood.request.title', 'Request Blood')}</h2>
                    <p className={styles.subtitle}>{t('blood.request.subtitle', 'Fill in the details to find a donor nearby.')}</p>
                </motion.div>

                {/* AI Section */}
                <motion.div variants={itemVariants} className={styles.aiSection}>
                    <div className={styles.aiHeader}>
                        <div className={styles.aiBadge}>
                            <Sparkle size={14} weight="fill" />
                            <span>AI ASSISTANT</span>
                        </div>
                        <strong className={styles.aiTitle}>{t('blood.request.ai_title', 'Smart Autofill')}</strong>
                    </div>
                    <p className={styles.aiHelper}>
                        {t('blood.request.ai_helper', 'Paste a message from WhatsApp or Facebook, and AI will fill the form for you.')}
                    </p>
                    <div className={styles.aiInputWrapper}>
                        <textarea
                            placeholder={t('blood.request.ai_placeholder', 'e.g. Urgent O+ blood needed at Dhaka Medical...')}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className={styles.aiInput}
                            rows={1}
                        />
                        <button
                            onClick={handleAIAnalyze}
                            disabled={analyzing || !aiPrompt}
                            className={styles.aiButton}
                        >
                            {analyzing ? (
                                <div className={styles.loadingSpinner}></div>
                            ) : (
                                <>
                                    <MagicWand size={18} weight="fill" />
                                    {t('blood.request.autofill', 'Auto-Fill Form')}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className={styles.divider}>
                    {t('blood.request.or_manual', 'OR FILL MANUALLY')}
                </motion.div>

                {/* Manual Form Content */}
                <form onSubmit={handleSubmit} className={styles.formContent}>
                    <div className={styles.grid}>
                        <motion.div variants={itemVariants} className={styles.inputGroup}>
                            <label className={styles.label}>
                                <Ticket size={18} weight="duotone" style={{ color: 'var(--primary)' }} />
                                {t('blood.request.group_label', 'Blood Group')}
                            </label>
                            <select
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">Select Group</option>
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </motion.div>

                        <motion.div variants={itemVariants} className={styles.inputGroup}>
                            <label className={styles.label}>
                                <MapPin size={18} weight="duotone" style={{ color: 'var(--primary)' }} />
                                {t('blood.request.location_label', 'Hospital Location')}
                            </label>
                            <input
                                type="text"
                                required
                                value={hospital}
                                onChange={(e) => setHospital(e.target.value)}
                                className={styles.input}
                                placeholder="Search hospital or clinic"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className={styles.inputGroup}>
                            <label className={styles.label}>
                                <Phone size={18} weight="duotone" style={{ color: 'var(--primary)' }} />
                                {t('blood.request.contact_label', 'Contact Number')}
                            </label>
                            <input
                                type="tel"
                                required
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className={styles.input}
                                placeholder="017..."
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className={styles.inputGroup}>
                            <label className={styles.label}>
                                <Heartbeat size={18} weight="duotone" style={{ color: 'var(--primary)' }} />
                                {t('blood.request.urgency_label', 'Urgency Level')}
                            </label>
                            <div className={styles.urgencyToggle}>
                                <button
                                    type="button"
                                    className={`${styles.urgencyBtn} ${urgency === 'NORMAL' ? styles.normalActive : ''}`}
                                    onClick={() => setUrgency('NORMAL')}
                                >
                                    {t('blood.request.normal', 'Normal')}
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.urgencyBtn} ${urgency === 'CRITICAL' ? styles.criticalActive : ''}`}
                                    onClick={() => setUrgency('CRITICAL')}
                                >
                                    {t('blood.request.critical', 'Critical')}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? 'Posting...' : (
                            <>
                                {t('blood.request.post_btn', 'Post Request')}
                                <PaperPlaneRight size={20} weight="fill" />
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}