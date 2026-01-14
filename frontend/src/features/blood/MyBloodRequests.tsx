import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Trash, Megaphone, Clock, CheckCircle, Spinner } from 'phosphor-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/MyBloodRequests.module.css';

interface BloodRequest {
    id: string;
    blood_group: string;
    hospital_name: string;
    urgency: 'NORMAL' | 'CRITICAL';
    status: string;
    created_at: string;
    reason: string;
}

export default function MyBloodRequests() {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (loading) return (
        <div className={styles.loadingWrapper}>
            <Spinner size={32} className={styles.spinner} />
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <Megaphone size={32} weight="duotone" />
                    <span className="t-text-gradient">{t('blood.my_requests.title')}</span>
                </h2>
                <p className={styles.subtitle}>{t('blood.my_requests.subtitle', 'Manage your requests and check their status.')}</p>
            </div>

            <div className={styles.list}>
                <AnimatePresence>
                    {requests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={styles.emptyState}
                        >
                            <p>{t('blood.my_requests.no_requests')}</p>
                        </motion.div>
                    ) : (
                        requests.map((req, idx) => (
                            <motion.div
                                key={req.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`${styles.card} t-card-glass ${req.urgency === 'CRITICAL' ? styles.cardCritical : ''}`}
                            >
                                <div className={styles.cardContent}>
                                    <div className={styles.leftCol}>
                                        <div className={`${styles.bloodGroup} ${req.urgency === 'CRITICAL' ? styles.bgCritical : ''}`}>
                                            {req.blood_group}
                                        </div>
                                    </div>
                                    <div className={styles.mainInfo}>
                                        <div className={styles.topRow}>
                                            <h3 className={styles.hospital}>{req.hospital_name}</h3>
                                            {req.status === 'FULFILLED' && (
                                                <span className={styles.statusBadge}>
                                                    <CheckCircle weight="fill" />
                                                    {t('blood.my_requests.fulfilled')}
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.metadata}>
                                            <span className={styles.timeText}>
                                                <Clock size={14} />
                                                {formatDistanceToNow(new Date(req.created_at))} ago
                                            </span>
                                        </div>
                                        {req.reason && <p className={styles.reasonText}>"{req.reason}"</p>}
                                    </div>
                                    <div className={styles.actions}>
                                        <button onClick={() => deleteRequest(req.id)} className={styles.deleteBtn} title={t('blood.my_requests.delete_btn')}>
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}