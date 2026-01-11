import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Bell, CheckCircle, Info, Warning, Trash } from 'phosphor-react';
import { formatDistanceToNow } from 'date-fns';

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
        markAllAsRead(); // পেজে আসলে সব রিড হয়ে যাবে
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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('notifications.loading')}</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <Bell size={32} color="var(--primary)" weight="fill" />
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('notifications.title')}</h2>
            </div>

            {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <Bell size={48} color="var(--text-secondary)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>{t('notifications.no_notifications')}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {notifications.map((notif) => (
                        <div key={notif.id} style={{
                            background: notif.is_read ? 'var(--surface)' : '#EFF6FF',
                            padding: '1.5rem', borderRadius: '12px',
                            border: '1px solid var(--border)',
                            display: 'flex', gap: '1rem', alignItems: 'start',
                            transition: 'background 0.3s'
                        }}>
                            <div style={{ marginTop: '2px' }}>{getIcon(notif.type)}</div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{notif.title}</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {formatDistanceToNow(new Date(notif.created_at))} ago
                                    </span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>{notif.message}</p>
                            </div>

                            <button
                                onClick={() => deleteNotification(notif.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
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