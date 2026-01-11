import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import {
    User,
    Envelope,
    Phone,
    Lock,
    Buildings,
    FirstAid,
    Heartbeat // <--- Fix 1: Replaced Stethoscope with Heartbeat
} from 'phosphor-react';

export default function SignupPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CITIZEN');

    const roles = [
        { value: 'CITIZEN', label: t('auth.roles.CITIZEN'), icon: <User size={20} /> },
        { value: 'DOCTOR', label: t('auth.roles.DOCTOR'), icon: <Heartbeat size={20} /> }, // <--- Used Heartbeat here
        { value: 'HOSPITAL', label: t('auth.roles.HOSPITAL'), icon: <Buildings size={20} /> },
        { value: 'DIAGNOSTIC', label: t('auth.roles.DIAGNOSTIC'), icon: <FirstAid size={20} /> },
    ];

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Supabase Sign Up with Metadata
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                        role: role,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                alert(t('auth.success_msg'));
                navigate('/login');
            }
        } catch (err: unknown) { // <--- Fix 2: Replaced 'any' with 'unknown'
            let message = t('auth.error_msg');
            if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'var(--background)', padding: '1rem'
        }}>
            <div style={{
                background: 'var(--surface)', padding: '2.5rem', borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '450px',
                border: '1px solid var(--border)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>{t('auth.signup_title')}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('auth.signup_subtitle')}</p>
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Role Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>{t('auth.role_label')}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {roles.map((r) => (
                                <div
                                    key={r.value}
                                    onClick={() => setRole(r.value)}
                                    style={{
                                        padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                        border: role === r.value ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: role === r.value ? 'var(--primary-light)' : 'transparent',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                                        textAlign: 'center', fontSize: '0.85rem', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ color: role === r.value ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                        {r.icon}
                                    </div>
                                    <span style={{ fontWeight: role === r.value ? 'bold' : 'normal' }}>{r.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div style={inputGroupStyle}>
                        <User size={20} color="var(--text-secondary)" />
                        <input
                            required type="text" placeholder={t('auth.full_name_label')}
                            value={fullName} onChange={e => setFullName(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Phone */}
                    <div style={inputGroupStyle}>
                        <Phone size={20} color="var(--text-secondary)" />
                        <input
                            required type="tel" placeholder={t('auth.phone_label')}
                            value={phone} onChange={e => setPhone(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Email */}
                    <div style={inputGroupStyle}>
                        <Envelope size={20} color="var(--text-secondary)" />
                        <input
                            required type="email" placeholder={t('auth.email_label')}
                            value={email} onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Password */}
                    <div style={inputGroupStyle}>
                        <Lock size={20} color="var(--text-secondary)" />
                        <input
                            required type="password" placeholder={t('auth.password_hint')}
                            value={password} onChange={e => setPassword(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        style={{
                            marginTop: '1rem', padding: '14px', background: 'var(--primary)', color: 'white',
                            border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold',
                            cursor: 'pointer', transition: 'background 0.2s'
                        }}
                    >
                        {loading ? t('auth.creating_account') : t('auth.signup_button')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    {t('auth.already_have_account')}{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                        {t('auth.login_button')}
                    </Link>
                </p>
            </div>
        </div>
    );
}

// Styles
const inputGroupStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px', borderRadius: '12px', background: 'var(--background)',
    border: '1px solid transparent'
};

const inputStyle: React.CSSProperties = {
    border: 'none', background: 'transparent', outline: 'none',
    width: '100%', fontSize: '1rem', color: 'var(--text-primary)'
};