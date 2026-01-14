import { useTranslation } from 'react-i18next';
import { Trash, Megaphone, Clock, CheckCircle, Spinner } from 'phosphor-react';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabaseClient';
import { bloodApi } from '@/services/api/blood';
import styles from './styles/MyBloodRequests.module.css';

export default function MyBloodRequests() {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();

    // 1. Fetch User ID
    const { data: userId } = useQuery({
        queryKey: ['userSession'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user?.id;
        }
    });

    // 2. Fetch Requests using React Query
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['myBloodRequests', userId],
        queryFn: () => bloodApi.getMyRequests(userId),
        enabled: !!userId, // Only run if userId is available
    });

    // 3. Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: bloodApi.deleteRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myBloodRequests'] });
        },
        onError: () => {
            alert(t('blood.my_requests.delete_fail', 'Failed to delete request.'));
        }
    });

    const handleDelete = async (id: string) => {
        if (!confirm(t('blood.my_requests.confirm_delete', 'Are you sure?'))) return;
        deleteMutation.mutate(id);
    };

    if (isLoading) return (
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
                <p className={styles.subtitle}>{t('blood.my_requests.subtitle')}</p>
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
                                                {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: i18n.language === 'bn' ? bn : undefined })}
                                            </span>
                                        </div>
                                        {req.reason && <p className={styles.reasonText}>"{req.reason}"</p>}
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            className={styles.deleteBtn}
                                            title={t('blood.my_requests.delete_btn')}
                                            disabled={deleteMutation.isPending}
                                        >
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