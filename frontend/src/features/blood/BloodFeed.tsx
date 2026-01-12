import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import type { BloodRequest } from '../../types';
import { Drop, Clock, Warning } from 'phosphor-react';
import { bn } from 'date-fns/locale';
import styles from './styles/BloodFeed.module.css';

export default function BloodFeed() {
    const { t, i18n } = useTranslation();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('blood_requests')
            .select('*, profiles(full_name, phone)')
            .eq('status', 'OPEN')
            .order('created_at', { ascending: false });

        if (!error && data) setRequests(data);
        setLoading(false);
    };

    const handleDonate = async (request: BloodRequest) => {
        if (!confirm(t('blood.feed.confirm_donate'))) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const { error } = await supabase.from('request_acceptors').insert({
                request_id: request.id,
                donor_id: user.id
            });

            if (error?.code === '23505') {
                alert(t('blood.feed.already_accepted'));
            } else if (error) {
                throw error;
            } else {
                alert(t('blood.feed.thank_you', { phone: request.profiles?.phone }));
                await fetchRequests();
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (loading) return <div className="text-center mt-8">{t('blood.feed.loading')}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>
                <span className={styles.liveDot}></span>
                {t('blood.feed.title')}
            </h2>

            {requests.length === 0 ? (
                <div className="text-center text-gray-500">{t('blood.feed.no_requests')}</div>
            ) : (
                requests.map(req => {
                    const isCritical = req.urgency === 'CRITICAL';
                    return (
                        <div key={req.id} className={`${styles.card} ${isCritical ? styles.cardCritical : ''}`}>
                            <div className={styles.cardHeader}>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className={`${styles.bloodGroup} ${isCritical ? styles.bgCritical : ''}`}>
                                        {req.blood_group}
                                    </div>
                                    <div>
                                        <h3 className={styles.hospitalName}>{req.hospital_name}</h3>
                                        <div className={styles.timeInfo}>
                                            <Clock size={16} />
                                            {req.created_at && formatDistanceToNow(new Date(req.created_at), {
                                                addSuffix: true,
                                                locale: i18n.language === 'bn' ? bn : undefined
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {isCritical && (
                                    <span className={styles.criticalBadge}>
                                        <Warning size={16} weight="fill" /> {t('blood.request.critical')}
                                    </span>
                                )}
                            </div>

                            {req.reason && <p className={styles.reasonBox}>"{req.reason}"</p>}

                            <div className={styles.cardFooter}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {t('blood.feed.requested_by')} <strong>{req.profiles?.full_name || t('common.unknown')}</strong>
                                </div>
                                <button onClick={() => handleDonate(req)} className={styles.donateBtn}>
                                    <Drop weight="fill" /> {t('blood.feed.donate_btn')}
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}