import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import {
    Phone, Envelope, SignOut, User, Drop, CalendarCheck, CaretRight,
    PencilSimple, Heartbeat, GraduationCap, Wallet
} from 'phosphor-react';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    role: string;
    blood_group?: string;
    district?: string;
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
                    district: data.district,
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

    if (loading) return <div className={styles.loading}>{t('profile.loading')}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>{t('profile.title')}</h2>
                <button
                    onClick={() => navigate('/profile/edit')}
                    className={styles.editBtn}
                >
                    <PencilSimple size={18} /> {t('common.edit')}
                </button>
            </div>

            {/* Profile Card */}
            <div className={styles.profileCard}>
                <div className={styles.avatarCircle}>
                    {profile?.full_name?.[0]?.toUpperCase() || <User />}
                </div>

                <h1 className={styles.userName}>{profile?.full_name}</h1>
                <div className={styles.userEmail}>{profile?.email}</div>

                <span className={styles.roleBadge}>
                    {profile?.role}
                </span>

                <div className={styles.badgeContainer}>
                    {profile?.blood_group && (
                        <Badge icon={<Drop weight="fill" />} text={profile.blood_group} color="#DC2626" bg="#FEF2F2" />
                    )}
                    {profile?.role === 'DOCTOR' && profile.specialty && (
                        <Badge icon={<Heartbeat weight="fill" />} text={profile.specialty} color="#059669" bg="#D1FAE5" />
                    )}
                </div>
            </div>

            {/* Doctor Specific Details */}
            {profile?.role === 'DOCTOR' && (
                <div className={styles.sectionWrapper}>
                    <h3 className={styles.sectionTitle}>{t('profile.professional')}</h3>
                    <div className={styles.infoStack}>
                        {profile.degree && <InfoRow icon={<GraduationCap />} label={t('profile.fields.degree')} value={profile.degree} />}
                        {profile.consultation_fee && <InfoRow icon={<Wallet />} label={t('profile.fields.fees')} value={`৳${profile.consultation_fee}`} />}
                        {profile.about && <div className={styles.aboutBox}>"{profile.about}"</div>}
                    </div>
                </div>
            )}

            {/* General Info */}
            <div className={styles.sectionWrapper}>
                <h3 className={styles.sectionTitle}>{t('profile.contact_info')}</h3>
                <div className={styles.infoStack}>
                    <InfoRow icon={<Phone />} label={t('profile.fields.phone')} value={profile?.phone || 'N/A'} />
                    <InfoRow icon={<Envelope />} label={t('profile.fields.email')} value={profile?.email || ''} />
                </div>
            </div>

            {/* Activity Links */}
            <div className={styles.sectionWrapper}>
                <h3 className={styles.sectionTitle}>{t('profile.activity')}</h3>
                <div className={styles.infoStack}>
                    {profile?.role === 'CITIZEN' && (
                        <NavButton onClick={() => navigate('/appointments')} icon={<CalendarCheck size={20} />} label={t('profile.my_appointments')} color="#3B82F6" bg="#EFF6FF" />
                    )}
                    <NavButton onClick={() => navigate('/blood/my-requests')} icon={<Drop size={20} />} label={t('profile.my_blood_requests')} color="#EF4444" bg="#FEF2F2" />
                    <NavButton onClick={() => navigate('/blood/register')} icon={<User size={20} />} label={t('profile.donor_settings')} color="#10B981" bg="#F0FDF4" />
                </div>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn}>
                <SignOut size={20} weight="bold" /> {t('common.logout')}
            </button>
        </div>
    );
}

// Helper Components
interface BadgeProps {
    icon: React.ReactNode;
    text: string;
    color: string;
    bg: string;
}
const Badge = ({ icon, text, color, bg }: BadgeProps) => (
    <div className={styles.customBadge} style={{ backgroundColor: bg, color: color }}>
        {icon} {text}
    </div>
);

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}
const InfoRow = ({ icon, label, value }: InfoRowProps) => (
    <div className={styles.infoRow}>
        <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
        <div>
            <small className={styles.infoLabel}>{label}</small>
            <div className={styles.infoValue}>{value}</div>
        </div>
    </div>
);

interface NavButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    color: string;
    bg: string;
}
const NavButton = ({ onClick, icon, label, color, bg }: NavButtonProps) => (
    <button onClick={onClick} className={styles.navButton}>
        <div className={styles.navContent}>
            <div className={styles.navIconBox} style={{ backgroundColor: bg, color: color }}>{icon}</div>
            <span className={styles.navLabel}>{label}</span>
        </div>
        <CaretRight size={18} color="#94A3B8" />
    </button>
);