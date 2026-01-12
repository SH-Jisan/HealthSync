import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Robot, Warning, FirstAid, Heartbeat, MagnifyingGlass } from 'phosphor-react';
import styles from './AIDoctor.module.css';

// Interface Update to match Backend/Mobile App
interface InternetDoctor {
    title: string;
    address?: string;
    rating?: number;
    userRatingsTotal?: number;
    link?: string;
}

interface AIResponse {
    condition: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    specialty: string;
    advice: string;
    potential_causes: string[];
    internet_doctors?: InternetDoctor[];
}

export default function AIDoctor() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResponse | null>(null);

    const handleConsult = async () => {
        if (!symptoms.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('triage-symptoms', {
                body: { symptoms, location: 'Dhaka' }
            });

            if (error) throw error;
            setResult(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('ai_doctor.error_fail');
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to map urgency to CSS class
    const getUrgencyClass = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return styles.urgencyHigh;
            case 'MEDIUM': return styles.urgencyMedium;
            default: return styles.urgencyLow;
        }
    };

    return (
        <div className={styles.container}>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <Robot size={32} color="white" />
                </div>
                <h1 className={styles.title}>{t('ai_doctor.title')}</h1>
                <p className={styles.subtitle}>{t('ai_doctor.subtitle')}</p>
            </div>

            {/* Input Section */}
            <div className={styles.inputSection}>
                <textarea
                    rows={4}
                    placeholder={t('ai_doctor.placeholder')}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className={styles.textarea}
                />
                <button
                    onClick={handleConsult}
                    disabled={loading || !symptoms}
                    className={styles.consultButton}
                >
                    {loading ? (
                        t('ai_doctor.analyzing')
                    ) : (
                        <>
                            <Heartbeat size={24} /> {t('ai_doctor.consult_btn')}
                        </>
                    )}
                </button>
            </div>

            {/* Result Card */}
            {result && (
                <div className={styles.resultCard}>

                    {/* Result Header */}
                    <div className={`${styles.resultHeader} ${getUrgencyClass(result.urgency)}`}>
                        <div className={styles.headerContent}>
                            <Warning size={24} weight="fill" className="inherit-color" />
                            <h2 className={styles.conditionName}>{result.condition}</h2>
                        </div>
                        <span className={styles.urgencyBadge}>
                            {t(`severity.${result.urgency}`)} {t('ai_doctor.urgency')}
                        </span>
                    </div>

                    <div className={styles.resultBody}>

                        {/* Causes */}
                        <div className={styles.causesSection}>
                            <h4 className={styles.sectionTitle}>{t('ai_doctor.causes')}</h4>
                            <ul className={styles.causesList}>
                                {result.potential_causes.map((cause, idx) => (
                                    <li key={idx} className={styles.causeItem}>{cause}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Advice */}
                        <div className={styles.adviceBox}>
                            <h4 className={styles.adviceHeader}>
                                <FirstAid size={20} /> {t('ai_doctor.advice')}
                            </h4>
                            <p className={styles.adviceText}>"{result.advice}"</p>
                        </div>

                        {/* Action Button */}
                        <div className={styles.actionSection}>
                            <p className={styles.specialistText}>
                                {t('ai_doctor.rec_specialist')} <strong>{result.specialty}</strong>
                            </p>

                            <button
                                onClick={() => navigate(`/doctors?specialty=${result.specialty}`, {
                                    state: { internetDoctors: result.internet_doctors }
                                })}
                                className={styles.findButton}
                            >
                                <MagnifyingGlass size={20} weight="bold" />
                                {t('ai_doctor.find_specialist', { specialty: result.specialty })}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}