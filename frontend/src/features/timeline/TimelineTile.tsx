/* eslint-disable */
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { FileText, Pill, Syringe } from 'phosphor-react'; // Icons
import { useTranslation } from 'react-i18next';
import type { MedicalEvent } from '../../types';
import styles from './TimelineTile.module.css';

interface Props {
    event: MedicalEvent;
    isLast: boolean;
}

export default function TimelineTile({ event, isLast }: Props) {
    const { t, i18n } = useTranslation();

    // Event Type অনুযায়ী আইকন
    const getIcon = () => {
        switch (event.event_type) {
            case 'PRESCRIPTION': return <Pill size={20} color="#9333EA" />; // Purple
            case 'VACCINATION': return <Syringe size={20} color="#00796B" />;
            default: return <FileText size={20} color="#00796B" />;
        }
    };

    // Severity অনুযায়ী স্টাইল
    const getBadgeClass = () => {
        switch (event.severity) {
            case 'HIGH': return styles.high;
            case 'MEDIUM': return styles.medium;
            default: return styles.low;
        }
    };

    return (
        <div className={`${styles.container} ${isLast ? styles.lastItem : ''}`}>
            <div className={styles.iconWrapper}>
                {getIcon()}
            </div>

            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.date}>
                        {format(new Date(event.event_date), 'dd MMM yyyy', {
                            locale: i18n.language === 'bn' ? bn : undefined
                        })}
                    </span>
                    <span className={`${styles.badge} ${getBadgeClass()}`}>
                        {t(`severity.${event.severity}`, event.severity)}
                    </span>
                </div>

                <h3 className={styles.title}>{event.title}</h3>

                {event.summary && <p className={styles.summary}>{event.summary}</p>}

                {/* Key Findings Chips (Optional) */}
                {event.key_findings && event.key_findings.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {event.key_findings.map((finding, idx) => (
                            <span key={idx} style={{
                                fontSize: '0.75rem',
                                background: '#F1F5F9',
                                padding: '4px 8px',
                                borderRadius: '6px'
                            }}>
                                {finding}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}