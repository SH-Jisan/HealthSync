// src/features/health-plan/HealthPlanView.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ForkKnife, Barbell, Warning, Sparkle } from 'phosphor-react';
import styles from './HealthPlan.module.css';
import { useTranslation } from 'react-i18next';

interface HealthPlan {
    diet: string;
    exercise: string;
    precautions: string;
    summary: string;
}

export default function HealthPlanView() {
    const { t, i18n } = useTranslation();
    const [plan, setPlan] = useState<HealthPlan | null>(null);
    const [loading, setLoading] = useState(false);

    // AI প্ল্যান জেনারেট ফাংশন
    const generatePlan = async () => {
        setLoading(true);
        try {
            // আমরা লেটেস্ট মেডিকেল ইভেন্টগুলো পাঠাবো
            const { data: events } = await supabase
                .from('medical_events')
                .select('*')
                .limit(5)
                .order('event_date', { ascending: false });

            // Pass the current language to the edge function
            const language = i18n.language === 'bn' ? 'bangla' : 'english';

            const { data, error } = await supabase.functions.invoke('generate-health-plan', {
                body: { history: events, language: language }
            });

            if (error) throw error;
            setPlan(data); // { summary, diet, exercise, precautions }

        } catch (err) {
            console.error('Error generating plan:', err);
            alert(t('health_plan.alert_fail'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h2>{t('health_plan.title')}</h2>
                        <p>{t('health_plan.subtitle')}</p>
                    </div>
                    <Sparkle size={48} weight="fill" style={{ opacity: 0.2 }} />
                </div>

                {!plan && (
                    <button className={styles.refreshButton} onClick={generatePlan} disabled={loading}>
                        {loading ? t('health_plan.analyzing') : t('health_plan.generate_btn')}
                    </button>
                )}
            </div>

            {plan && (
                <>
                    <div className={styles.grid}>
                        <div className={`${styles.section} ${styles.summaryCard}`}>
                            <div className={styles.sectionTitle}><Sparkle size={24} /> {t('health_plan.summary')}</div>
                            <p>{plan.summary}</p>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}><ForkKnife size={24} /> {t('health_plan.diet')}</div>
                            <p>{plan.diet}</p>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}><Barbell size={24} /> {t('health_plan.exercise')}</div>
                            <p>{plan.exercise}</p>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}><Warning size={24} color="#EF4444" /> {t('health_plan.precautions')}</div>
                            <p>{plan.precautions}</p>
                        </div>
                    </div>
                    <button style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)' }} onClick={generatePlan}>
                        {t('health_plan.regenerate_btn')}
                    </button>
                </>
            )}
        </div>
    );
}