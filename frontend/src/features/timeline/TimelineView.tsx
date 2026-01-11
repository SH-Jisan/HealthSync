import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import type { MedicalEvent } from '../../types';
import TimelineTile from './TimelineTile';

// Props যোগ করা হলো (অপশনাল)
interface Props {
    userId?: string;
}

export default function TimelineView({ userId }: Props) {
    const { t } = useTranslation();
    const [events, setEvents] = useState<MedicalEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [userId]); // userId পাল্টালে আবার ফেচ হবে

    const fetchEvents = async () => {
        let targetId = userId;

        // যদি userId না দেওয়া থাকে, তবে নিজের আইডি নাও
        if (!targetId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            targetId = user.id;
        }

        const { data, error } = await supabase
            .from('medical_events')
            .select('*')
            .eq('patient_id', targetId)
            .order('event_date', { ascending: false });

        if (error) {
            console.error('Error fetching timeline:', error);
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>{t('timeline.loading')}</div>;

    if (events.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
                <h3>{t('timeline.no_records')}</h3>
                <p>{userId ? t('timeline.no_history_patient') : t('timeline.no_history_user')}</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>{t('timeline.title')}</h3>

            {events.map((event, index) => (
                <TimelineTile
                    key={event.id}
                    event={event}
                    isLast={index === events.length - 1}
                />
            ))}
        </div>
    );
}