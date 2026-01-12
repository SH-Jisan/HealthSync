import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Bell, CheckCircle, Info, Warning, Trash } from 'phosphor-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './NotificationsPage.module.css';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING';
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch notifications from DB
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setNotifications(data as Notification[]);
        }
        setLoading(false);
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();
        markAllAsRead();
    }, []);

    const deleteNotification = async (id: string) => {
        await supabase.from('notifications').delete().eq('id', id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle size={24} color="#16A34A" weight="fill" />;
            case 'WARNING': return <Warning size={24} color="#EA580C" weight="fill" />;
            default: return <Info size={24} color="#3B82F6" weight="fill" />;
        }
    };

    if (loading) return <div className={styles.loading}>{t('notifications.loading')}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Bell size={32} color="var(--primary)" weight="fill" />
                <h2 className={styles.title}>{t('notifications.title')}</h2>
            </div>

            {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                    <Bell size={48} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>{t('notifications.no_notifications')}</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`${styles.card} ${!notif.is_read ? styles.unread : ''}`}
                        >
                            <div className={styles.iconWrapper}>{getIcon(notif.type)}</div>

                            <div className={styles.content}>
                                <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>{notif.title}</h4>
                                    <span className={styles.time}>
                                        {formatDistanceToNow(new Date(notif.created_at))} ago
                                    </span>
                                </div>
                                <p className={styles.message}>{notif.message}</p>
                            </div>

                            <button
                                onClick={() => deleteNotification(notif.id)}
                                className={styles.deleteBtn}
                                title={t('notifications.delete_tooltip')}
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}