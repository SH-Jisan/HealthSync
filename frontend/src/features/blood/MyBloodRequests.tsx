import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { Trash } from 'phosphor-react'; // Fix: Removed 'Drop'
import { formatDistanceToNow } from 'date-fns';

// Fix: Defined Interface to replace 'any'
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
    // Fix: Replaced 'any[]' with 'BloodRequest[]'
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Fix: Moved fetchMyRequests ABOVE useEffect
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
        fetchMyRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{t('blood.my_requests.title')}</h2>

            {requests.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('blood.my_requests.no_requests')}</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {requests.map(req => (
                        <div key={req.id} style={{
                            background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px',
                            borderLeft: req.urgency === 'CRITICAL' ? '5px solid red' : '5px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#DC2626' }}>{req.blood_group}</span>
                                    <span style={{ fontWeight: 600 }}>{req.hospital_name}</span>
                                    {req.status === 'FULFILLED' && <span style={{ background: '#DCFCE7', color: 'green', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '10px' }}>{t('blood.my_requests.fulfilled')}</span>}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {t('blood.my_requests.posted')} {formatDistanceToNow(new Date(req.created_at))} ago
                                </div>
                            </div>

                            <button
                                onClick={() => deleteRequest(req.id)}
                                style={{
                                    background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '8px',
                                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                                }}
                            >
                                <Trash size={18} /> {t('blood.my_requests.delete_btn')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}