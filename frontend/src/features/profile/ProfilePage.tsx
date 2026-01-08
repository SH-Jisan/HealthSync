import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Phone, Envelope, SignOut, User } from 'phosphor-react';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // ইউজারের মেটাডাটা থেকে তথ্য নেয়া (Supabase Auth)
            const meta = user.user_metadata;
            setProfile({
                full_name: meta.full_name || 'User',
                email: user.email,
                phone: meta.phone || 'N/A',
                role: meta.role || 'CITIZEN',
            });
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await supabase.auth.signOut();
            navigate('/');
        }
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading Profile...</div>;

    return (
        <div className={styles.container}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>My Profile</h2>

            <div className={styles.profileCard}>
                <div className={styles.avatar}>
                    {profile?.full_name?.[0]?.toUpperCase() || <User />}
                </div>

                <h1 className={styles.name}>{profile?.full_name}</h1>
                <div className={styles.email}>{profile?.email}</div>

                <span className={styles.roleChip}>
          {profile?.role}
        </span>

                <div className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <Phone size={24} color="var(--primary)" />
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Phone</small>
                            <div style={{ fontWeight: 500 }}>{profile?.phone}</div>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <Envelope size={24} color="var(--primary)" />
                        <div>
                            <small style={{ color: 'var(--text-secondary)' }}>Email</small>
                            <div style={{ fontWeight: 500 }}>{profile?.email}</div>
                        </div>
                    </div>
                </div>

                <button className={styles.logoutButton} onClick={handleLogout}>
                    <SignOut size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Log Out
                </button>
            </div>
        </div>
    );
}