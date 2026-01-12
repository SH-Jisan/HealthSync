import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Trash } from 'phosphor-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './styles/MyBloodRequests.module.css';

interface BloodRequest {
    id: string;
    blood_group: string;
    hospital_name: string;
    urgency: 'NORMAL' | 'CRITICAL';
    status: string;
    created_at: string;
}

export default function MyBloodRequests() {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyRequests = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('blood_requests')
            .select('*')
            .eq('requester_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setRequests(data as BloodRequest[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMyRequests();
    }, []);

    const deleteRequest = async (id: string) => {
        if (!confirm(t('blood.my_requests.confirm_delete'))) return;

        const { error } = await supabase.from('blood_requests').delete().eq('id', id);
        if (error) {
            alert(t('blood.my_requests.delete_fail'));
        } else {
            setRequests(prev => prev.filter(r => r.id !== id));
        }
    };

    if (loading) return <div>{t('blood.my_requests.loading')}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('blood.my_requests.title')}</h2>

            {requests.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('blood.my_requests.no_requests')}</div>
            ) : (
                <div className={styles.list}>
                    {requests.map(req => (
                        <div key={req.id} className={`${styles.card} ${req.urgency === 'CRITICAL' ? styles.cardCritical : ''}`}>
                            <div className={styles.requestInfo}>
                                <div className={styles.headerRow}>
                                    <span className={styles.bloodGroup}>{req.blood_group}</span>
                                    <span className={styles.hospital}>{req.hospital_name}</span>
                                    {req.status === 'FULFILLED' && (
                                        <span className={styles.statusBadge}>{t('blood.my_requests.fulfilled')}</span>
                                    )}
                                </div>
                                <div className={styles.timeText}>
                                    {t('blood.my_requests.posted')} {formatDistanceToNow(new Date(req.created_at))} ago
                                </div>
                            </div>

                            <button onClick={() => deleteRequest(req.id)} className={styles.deleteBtn}>
                                <Trash size={18} /> {t('blood.my_requests.delete_btn')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}