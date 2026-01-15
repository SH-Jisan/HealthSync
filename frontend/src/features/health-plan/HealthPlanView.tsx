// src/features/health-plan/HealthPlanView.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import { ForkKnife, Barbell, Warning, Sparkle, FloppyDisk, ArrowsClockwise, CheckCircle } from 'phosphor-react';
import styles from './HealthPlan.module.css';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

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
    const [isSaved, setIsSaved] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Initial Fetch (Load Saved Plan)
    useEffect(() => {
        const fetchSavedPlan = async () => {
            // Artificial Delay 2 seconds
            const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setPageLoading(false);
                return;
            }

            const dbPromise = supabase
                .from('ai_health_plans')
                .select('*')
                .eq('user_id', user.id)
                .single();

            const [_, { data, error }] = await Promise.all([delayPromise, dbPromise]);

            if (data && !error) {
                setPlan({
                    summary: data.summary,
                    diet: data.diet_plan,
                    exercise: data.exercise_plan,
                    precautions: data.precautions
                });
                setIsSaved(true);
                setLastSaved(data.created_at);
            }
            setPageLoading(false);
        };
        fetchSavedPlan();
    }, []);

    if (pageLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.pageLoader}>
                    <Sparkle size={48} weight="fill" className={styles.spin} />
                    <p className={styles.loaderText}>{t('health_plan.analyzing') || "Loading Health Plan..."}</p>
                </div>
            </div>
        );
    }

    const generatePlan = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please login to generate health plan");
                return;
            }

            // Fetch latest medical history
            const { data: events } = await supabase
                .from('medical_events')
                .select('title, event_type, severity, summary')
                .eq('patient_id', user.id)
                .limit(10)
                .order('event_date', { ascending: false });

            const language = i18n.language === 'bn' ? 'bangla' : 'english';

            const { data, error } = await supabase.functions.invoke('generate-health-plan', {
                body: { history: events, language: language }
            });

            if (error) throw error;
            setPlan(data); // { summary, diet, exercise, precautions }
            setIsSaved(false); // New plan is unsaved

        } catch (err) {
            console.error('Error generating plan:', err);
            alert(t('health_plan.alert_fail'));
        } finally {
            setLoading(false);
        }
    };

    const savePlan = async () => {
        if (!plan) return;
        setSaveLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const payload = {
                user_id: user.id,
                summary: plan.summary,
                diet_plan: plan.diet,
                exercise_plan: plan.exercise,
                precautions: plan.precautions,
                created_at: new Date().toISOString() // Update timestamp
            };

            const { error } = await supabase
                .from('ai_health_plans')
                .upsert(payload, { onConflict: 'user_id' });

            if (error) throw error;

            setIsSaved(true);
            setLastSaved(new Date().toISOString());
            alert("Health Plan saved successfully!");

        } catch (err) {
            console.error("Error saving plan:", err);
            alert("Failed to save plan.");
        } finally {
            setSaveLoading(false);
        }
    };

    const renderContent = (content: unknown) => {
        if (!content) return null;
        if (typeof content === 'string') return <p>{content}</p>;
        if (Array.isArray(content)) {
            return (
                <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                    {content.map((item, i) => (
                        <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                    ))}
                </ul>
            );
        }
        if (typeof content === 'object') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(content).map(([key, value]) => (
                        <div key={key}>
                            <strong>{key}: </strong>
                            {JSON.stringify(value)}
                        </div>
                    ))}
                </div>
            );
        }
        return <p>{String(content)}</p>;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', width: '100%' }}>
                    <div>
                        <h2>{t('health_plan.title')}</h2>
                        <p>{t('health_plan.subtitle')}</p>
                        {lastSaved && isSaved && (
                            <div className={styles.savedText}>
                                <CheckCircle size={16} weight="fill" color={isSaved ? "#22C55E" : "var(--primary)"} />
                                <span>Saved on: {format(new Date(lastSaved), 'dd MMM yyyy, hh:mm a')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {!plan && (
                    <button className={styles.refreshButton} onClick={generatePlan} disabled={loading}>
                        {loading ? (
                            <>
                                <Sparkle size={20} className={styles.spin} />
                                {t('health_plan.analyzing')}
                            </>
                        ) : (
                            <>
                                <Sparkle size={20} />
                                {t('health_plan.generate_btn')}
                            </>
                        )}
                    </button>
                )}
            </div>

            {plan && (
                <>
                    {/* Action Bar */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                            className={styles.refreshButton}
                            onClick={generatePlan}
                            disabled={loading}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                padding: '0.6rem 1.5rem',
                                marginTop: 0
                            }}
                        >
                            {loading ? <ArrowsClockwise size={20} className={styles.spin} /> : <ArrowsClockwise size={20} />}
                            {t('health_plan.regenerate_btn')}
                        </button>

                        <button
                            className={styles.refreshButton}
                            onClick={savePlan}
                            disabled={saveLoading || isSaved}
                            style={{
                                opacity: isSaved ? 0.9 : 1,
                                cursor: isSaved ? 'default' : 'pointer',
                                background: isSaved ? 'var(--surface)' : 'var(--primary)',
                                color: isSaved ? 'var(--text-primary)' : 'white',
                                border: isSaved ? '1px solid var(--border)' : 'none',
                                padding: '0.6rem 1.5rem',
                                marginTop: 0
                            }}
                        >
                            {isSaved ? <CheckCircle size={20} weight="fill" color="#22C55E" /> : <FloppyDisk size={20} />}
                            {isSaved ? 'Saved' : 'Save Plan'}
                        </button>
                    </div>

                    <div className={styles.grid}>
                        <div className={`${styles.section} ${styles.summaryCard}`}>
                            <div className={styles.sectionTitle}><Sparkle size={24} /> {t('health_plan.summary')}</div>
                            <div className={styles.content}>{renderContent(plan.summary)}</div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}><ForkKnife size={24} /> {t('health_plan.diet')}</div>
                            <div className={styles.content}>{renderContent(plan.diet)}</div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}><Barbell size={24} /> {t('health_plan.exercise')}</div>
                            <div className={styles.content}>{renderContent(plan.exercise)}</div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}><Warning size={24} color="#EF4444" /> {t('health_plan.precautions')}</div>
                            <div className={styles.content}>{renderContent(plan.precautions)}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}