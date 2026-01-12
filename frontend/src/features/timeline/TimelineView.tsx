import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { FileText, Calendar, CaretRight } from 'phosphor-react';
import { format } from 'date-fns';
import EventDetailsModal from './EventDetailsModal';

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

    useEffect(() => {
        fetchTimeline();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

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

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                {t('timeline.loading', 'Loading history...')}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
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
        <div>
            <div style={{ display: 'grid', gap: '1.5rem', position: 'relative' }}>
                {/* Vertical Line */}
                <div
                    style={{
                        position: 'absolute',
                        left: '24px',
                        top: '20px',
                        bottom: '20px',
                        width: '2px',
                        background: 'var(--border)',
                    }}
                />

                {events.map((event) => (
                    <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background:
                                    event.event_type === 'PRESCRIPTION' ? '#EFF6FF' : '#F0FDF4',
                                color:
                                    event.event_type === 'PRESCRIPTION' ? '#1D4ED8' : '#15803D',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '4px solid var(--background)',
                                flexShrink: 0,
                            }}
                        >
                            <FileText size={24} />
                        </div>

                        {/* Card */}
                        <div
                            style={{
                                flex: 1,
                                background: 'var(--surface)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                  <span
                      style={{
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                      }}
                  >
                    {event.event_type.replace('_', ' ')}
                  </span>

                                    <h3 style={{ margin: '5px 0' }}>{event.title}</h3>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        <Calendar size={16} />
                                        {format(new Date(event.event_date), 'dd MMM yyyy')} •{' '}
                                        {event.uploader?.full_name || 'Self/System'}
                                    </div>
                                </div>

                                <CaretRight size={20} color="#CBD5E1" />
                            </div>

                            <p
                                style={{
                                    color: 'var(--text-secondary)',
                                    marginTop: '0.75rem',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {event.summary || t('timeline.no_details', 'No details available.')}
                            </p>

                            {event.key_findings?.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
                                    {event.key_findings.slice(0, 3).map((tag, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                background: '#F1F5F9',
                                                padding: '4px 10px',
                                                borderRadius: '15px',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                      {tag}
                    </span>
                                    ))}
                                    {event.key_findings.length > 3 && (
                                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
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
