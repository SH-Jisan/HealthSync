import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Phone, Envelope, SignOut, User, Drop, CalendarCheck, MapPin, CaretRight } from 'phosphor-react';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
    role: string;
    blood_group?: string;
    district?: string;
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Fetch detailed profile from DB instead of just metadata
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (data) {
                setProfile({
                    full_name: data.full_name || 'User',
                    email: user.email || '',
                    phone: data.phone || 'N/A',
                    role: data.role || 'CITIZEN',
                    blood_group: data.blood_group,
                    district: data.district
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
        if (window.confirm('Are you sure you want to logout?')) {
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading Profile...</div>;

    return (
        <div className={styles.container} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--primary)', textAlign: 'center' }}>My Profile</h2>

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

                {/* Extra Details */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '1.5rem' }}>
                    {profile?.blood_group && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#FEF2F2', color: '#DC2626', padding: '8px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                            <Drop weight="fill" /> {profile.blood_group}
                        </div>
                    )}
                    {profile?.district && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#F0FDF4', color: '#166534', padding: '8px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                            <MapPin weight="fill" /> {profile.district}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem', paddingLeft: '10px' }}>Personal Information</h3>

                <div className={styles.infoSection} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className={styles.infoCard} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <Phone size={24} color="var(--text-secondary)" />
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Phone</small>
                            <div style={{ fontWeight: 500 }}>{profile?.phone}</div>
                        </div>
                    </div>

                    <div className={styles.infoCard} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <Envelope size={24} color="var(--text-secondary)" />
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Email</small>
                            <div style={{ fontWeight: 500 }}>{profile?.email}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Links */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem', paddingLeft: '10px' }}>Activity & Settings</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {profile?.role === 'CITIZEN' && (
                        <button
                            onClick={() => navigate('/appointments')}
                            style={actionButtonStyle}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ padding: '8px', background: '#EFF6FF', borderRadius: '50%', color: '#3B82F6' }}><CalendarCheck size={20} /></div>
                                <span style={{ fontWeight: 600 }}>My Appointments</span>
                            </div>
                            <CaretRight size={18} color="#94A3B8" />
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/blood/my-requests')}
                        style={actionButtonStyle}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ padding: '8px', background: '#FEF2F2', borderRadius: '50%', color: '#EF4444' }}><Drop size={20} /></div>
                            <span style={{ fontWeight: 600 }}>My Blood Requests</span>
                        </div>
                        <CaretRight size={18} color="#94A3B8" />
                    </button>

                    <button
                        onClick={() => navigate('/blood/register')}
                        style={actionButtonStyle}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ padding: '8px', background: '#F0FDF4', borderRadius: '50%', color: '#10B981' }}><User size={20} /></div>
                            <span style={{ fontWeight: 600 }}>Edit Donor Profile</span>
                        </div>
                        <CaretRight size={18} color="#94A3B8" />
                    </button>
                </div>
            </div>

            <button
                className={styles.logoutButton}
                onClick={handleLogout}
                style={{
                    marginTop: '2rem', width: '100%', padding: '15px', background: '#FEF2F2',
                    color: '#DC2626', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                }}
            >
                <SignOut size={20} weight="bold" />
                Log Out
            </button>
        </div>
    );
}

const actionButtonStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px', background: 'white', border: '1px solid var(--border)', borderRadius: '12px',
    cursor: 'pointer', fontSize: '1rem', color: 'var(--text-primary)', transition: 'background 0.2s'
};