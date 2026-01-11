import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import {
    Phone,
    Envelope,
    SignOut,
    User,
    Drop,
    CalendarCheck,
    CaretRight,
    PencilSimple,
    Heartbeat,
    GraduationCap,
    Wallet
} from 'phosphor-react';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';

// Interface Update
interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    role: string;
    blood_group?: string;
    district?: string;
    // Doctor fields
    specialty?: string;
    degree?: string;
    consultation_fee?: number;
    about?: string;
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                setProfile({
                    full_name: data.full_name || 'User',
                    email: user.email || '',
                    phone: data.phone || 'N/A',
                    role: data.role || 'CITIZEN',
                    blood_group: data.blood_group,
                    district: data.district, // Or address
                    specialty: data.specialty,
                    degree: data.degree,
                    consultation_fee: data.consultation_fee,
                    about: data.about
                });
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        if (window.confirm(t('common.confirm_logout'))) {
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>{t('profile.loading')}</div>;

    return (
        <div className={styles.container} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('profile.title')}</h2>
                <button
                    onClick={() => navigate('/profile/edit')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px',
                        borderRadius: '20px', border: '1px solid var(--primary)', background: 'white',
                        color: 'var(--primary)', cursor: 'pointer', fontWeight: 600
                    }}
                >
                    <PencilSimple size={18} /> {t('common.edit')}
                </button>
            </div>

            {/* Profile Card */}
            <div className={styles.profileCard} style={{ padding: '2rem', textAlign: 'center', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{
                    width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '50%',
                    background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 'bold'
                }}>
                    {profile?.full_name?.[0]?.toUpperCase() || <User />}
                </div>

                <h1 style={{ fontSize: '1.5rem', margin: '0 0 5px 0' }}>{profile?.full_name}</h1>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{profile?.email}</div>

                <span style={{
                    background: '#EFF6FF', color: '#1D4ED8', padding: '6px 16px', borderRadius: '20px',
                    fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px'
                }}>
                    {profile?.role}
                </span>

                {/* Role Specific Badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    {profile?.blood_group && (
                        <Badge icon={<Drop weight="fill" />} text={profile.blood_group} color="#DC2626" bg="#FEF2F2" />
                    )}
                    {profile?.role === 'DOCTOR' && profile.specialty && (
                        <Badge icon={<Heartbeat weight="fill" />} text={profile.specialty} color="#059669" bg="#D1FAE5" />
                    )}
                </div>
            </div>

            {/* Doctor Specific Details Section */}
            {profile?.role === 'DOCTOR' && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem', paddingLeft: '10px' }}>{t('profile.professional')}</h3>
                    <div className={styles.infoSection} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {profile.degree && <InfoRow icon={<GraduationCap />} label={t('profile.fields.degree')} value={profile.degree} />}
                        {profile.consultation_fee && <InfoRow icon={<Wallet />} label={t('profile.fields.fees')} value={`৳${profile.consultation_fee}`} />}
                        {profile.about && <div style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem', color: '#64748B', fontStyle: 'italic' }}>"{profile.about}"</div>}
                    </div>
                </div>
            )}

            {/* General Info */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem', paddingLeft: '10px' }}>{t('profile.contact_info')}</h3>
                <div className={styles.infoSection} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <InfoRow icon={<Phone />} label={t('profile.fields.phone')} value={profile?.phone || 'N/A'} />
                    <InfoRow icon={<Envelope />} label={t('profile.fields.email')} value={profile?.email || ''} />
                </div>
            </div>

            {/* Activity Links */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem', paddingLeft: '10px' }}>{t('profile.activity')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {profile?.role === 'CITIZEN' && (
                        <NavButton onClick={() => navigate('/appointments')} icon={<CalendarCheck size={20} />} label={t('profile.my_appointments')} color="#3B82F6" bg="#EFF6FF" />
                    )}
                    <NavButton onClick={() => navigate('/blood/my-requests')} icon={<Drop size={20} />} label={t('profile.my_blood_requests')} color="#EF4444" bg="#FEF2F2" />
                    <NavButton onClick={() => navigate('/blood/register')} icon={<User size={20} />} label={t('profile.donor_settings')} color="#10B981" bg="#F0FDF4" />
                </div>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: '2rem', width: '100%', padding: '15px', background: '#FEF2F2',
                    color: '#DC2626', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                }}
            >
                <SignOut size={20} weight="bold" /> {t('common.logout')}
            </button>
        </div>
    );
}

// Helper Components for Cleaner JSX
const Badge = ({ icon, text, color, bg }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: bg, color: color, padding: '8px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem' }}>
        {icon} {text}
    </div>
);

const InfoRow = ({ icon, label, value }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
        <div>
            <small style={{ color: 'var(--text-secondary)' }}>{label}</small>
            <div style={{ fontWeight: 500 }}>{value}</div>
        </div>
    </div>
);

const NavButton = ({ onClick, icon, label, color, bg }: any) => (
    <button onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'white', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ padding: '8px', background: bg, borderRadius: '50%', color: color }}>{icon}</div>
            <span style={{ fontWeight: 600 }}>{label}</span>
        </div>
        <CaretRight size={18} color="#94A3B8" />
    </button>
);