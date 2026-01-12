import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Sparkle } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
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
                alert(t('blood.request.ai_success'));
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
            <h2 className={styles.title}>{t('blood.request.title')}</h2>

            {/* AI Section */}
            <div className={styles.aiContainer}>
                <div className={styles.aiHeader}>
                    <Sparkle size={24} weight="fill" />
                    <span>{t('blood.request.ai_fill')}</span>
                </div>
                <textarea
                    placeholder={t('blood.request.ai_placeholder')}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    className={styles.aiInput}
                />
                <button onClick={handleAIAnalyze} disabled={analyzing} className={styles.aiButton}>
                    {analyzing ? t('blood.request.analyzing') : t('blood.request.autofill')}
                </button>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className={styles.formBox}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>{t('blood.request.group_label')}</label>
                    <select
                        value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                        className={styles.select}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>{t('blood.request.location_label')}</label>
                    <input
                        type="text" required value={hospital} onChange={(e) => setHospital(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>{t('blood.request.urgency_label')}</label>
                    <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as 'NORMAL' | 'CRITICAL')}
                        className={`${styles.select} ${urgency === 'CRITICAL' ? styles.urgentSelect : ''}`}
                    >
                        <option value="NORMAL">{t('blood.request.normal')}</option>
                        <option value="CRITICAL">{t('blood.request.critical')}</option>
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>{t('blood.request.note_label')}</label>
                    <textarea
                        value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                        className={styles.textarea}
                    />
                </div>

                <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? t('blood.request.posting') : t('blood.request.post_btn')}
                </button>
            </form>
        </div>
    );
}