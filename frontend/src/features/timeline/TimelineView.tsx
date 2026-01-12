import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { FileText, Calendar, CaretRight } from 'phosphor-react';
import { format } from 'date-fns';
import EventDetailsModal from './EventDetailsModal';
import styles from './styles/TimelineView.module.css';

interface TimelineEvent {
    id: string;
    event_type: string;
    title: string;
    event_date: string;
    summary?: string;
    extracted_text?: string;
    key_findings?: string[];
    uploader?: { full_name: string; specialty?: string };
    profiles?: { full_name: string; phone: string };
    patient_id: string;
}

export default function TimelineView({ userId }: { userId?: string }) {
    const { t } = useTranslation();
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    const fetchTimeline = async () => {
        setLoading(true);

        let targetId = userId;
        if (!targetId) {
            const { data } = await supabase.auth.getUser();
            targetId = data.user?.id;
        }
        if (!targetId) return;

        const { data, error } = await supabase
            .from('medical_events')
            .select(
                '*, uploader:uploader_id(full_name, specialty), profiles:patient_id(full_name, phone)'
            )
            .eq('patient_id', targetId)
            .order('event_date', { ascending: false });

        if (!error && data) {
            setEvents(data as unknown as TimelineEvent[]);
        }

        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTimeline();
    }, [userId]);

    if (loading) {
        return <div className={styles.loading}>{t('timeline.loading', 'Loading history...')}</div>;
    }

    if (events.length === 0) {
        return (
            <div className={styles.noRecords}>
                <h3>{t('timeline.no_records', 'No medical records found')}</h3>
                <p>
                    {userId
                        ? t('timeline.no_history_patient', 'This patient has no history yet.')
                        : t('timeline.no_history_user', 'You have no medical history yet.')}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.timeline}>
                {/* Vertical Line */}
                <div className={styles.verticalLine} />

                {events.map((event) => (
                    <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={styles.eventItem}
                    >
                        {/* Icon */}
                        <div
                            className={`${styles.iconBox} ${event.event_type === 'PRESCRIPTION' ? styles.prescriptionIcon : styles.reportIcon}`}
                        >
                            <FileText size={24} />
                        </div>

                        {/* Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <span className={styles.eventType}>
                                        {event.event_type.replace('_', ' ')}
                                    </span>

                                    <h3 className={styles.title}>{event.title}</h3>

                                    <div className={styles.meta}>
                                        <Calendar size={16} />
                                        {format(new Date(event.event_date), 'dd MMM yyyy')} •{' '}
                                        {event.uploader?.full_name || 'Self/System'}
                                    </div>
                                </div>

                                <CaretRight size={20} className={styles.caret} />
                            </div>

                            <p className={styles.summary}>
                                {event.summary || t('timeline.no_details', 'No details available.')}
                            </p>

                            {event.key_findings?.length > 0 && (
                                <div className={styles.findings}>
                                    {event.key_findings.slice(0, 3).map((tag, i) => (
                                        <span key={i} className={styles.tag}>
                                            {tag}
                                        </span>
                                    ))}
                                    {event.key_findings.length > 3 && (
                                        <span className={styles.moreCount}>
                                            +{event.key_findings.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Details Modal */}
            {selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
}