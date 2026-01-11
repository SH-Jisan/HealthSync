// src/features/blood/BloodFeed.tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
// Fixed TS1484: Added 'type' keyword
import type { BloodRequest } from '../../types';
import { Drop, Clock, Warning } from 'phosphor-react'; // Removed unused 'MapPin'
import { bn } from 'date-fns/locale';

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
                fetchRequests();
            }
        } catch (err: unknown) {
            // Fixed 'any' type error
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('An unknown error occurred');
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>{t('blood.feed.loading')}</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '12px', height: '12px', background: 'red', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px red' }}></span>
                {t('blood.feed.title')}
            </h2>

            {requests.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('blood.feed.no_requests')}</div>
            ) : (
                requests.map(req => (
                    <div key={req.id} style={{
                        background: 'var(--surface)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        marginBottom: '1rem',
                        borderLeft: req.urgency === 'CRITICAL' ? '5px solid red' : '5px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{
                                    background: req.urgency === 'CRITICAL' ? '#EF4444' : '#FCA5A5',
                                    color: 'white',
                                    padding: '10px 15px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}>
                                    {req.blood_group}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{req.hospital_name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        <Clock size={16} />
                                        {/* Ensure valid date for date-fns */}
                                        {req.created_at && formatDistanceToNow(new Date(req.created_at), {
                                            addSuffix: true,
                                            locale: i18n.language === 'bn' ? bn : undefined
                                        })}
                                    </div>
                                </div>
                            </div>

                            {req.urgency === 'CRITICAL' && (
                                <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Warning size={16} weight="fill" /> {t('blood.request.critical')}
                                </span>
                            )}
                        </div>

                        {req.reason && <p style={{ background: 'var(--background)', padding: '10px', borderRadius: '8px', fontSize: '0.95rem' }}>"{req.reason}"</p>}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {t('blood.feed.requested_by')} <strong>{req.profiles?.full_name || t('common.unknown')}</strong>
                            </div>
                            <button
                                onClick={() => handleDonate(req)}
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Drop weight="fill" /> {t('blood.feed.donate_btn')}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}