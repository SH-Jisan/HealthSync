// src/features/auth/LoginPage.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { Envelope, Lock } from 'phosphor-react';

export default function LoginPage() {
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            navigate('/dashboard');
        }

        setLoading(false);
    };

    const inputGroupStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        background: 'white',
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
            <form
                onSubmit={handleLogin}
                style={{
                    padding: '2rem',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    width: '320px',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1
                        style={{
                            color: 'var(--primary)',
                            fontSize: '2rem',
                            marginBottom: '0.5rem',
                        }}
                    >
                        {t('auth.welcome_back')}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {t('auth.login_subtitle')}
                    </p>
                </div>

                {/* Email */}
                <div style={inputGroupStyle}>
                    <Envelope size={20} color="var(--text-secondary)" />
                    <input
                        required
                        type="email"
                        placeholder={t('auth.email_label')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '1rem',
                        }}
                    />
                </div>

                {/* Password */}
                <div style={{ ...inputGroupStyle, marginTop: '1rem' }}>
                    <Lock size={20} color="var(--text-secondary)" />
                    <input
                        required
                        type="password"
                        placeholder={t('auth.password_label')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '1rem',
                        }}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginTop: '1.5rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    {loading ? t('common.loading') : t('auth.login_button')}
                </button>

                {/* Signup Link */}
                <p
                    style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        color: 'var(--text-secondary)',
                    }}
                >
                    {t('auth.no_account')}{' '}
                    <Link
                        to="/signup"
                        style={{
                            color: 'var(--primary)',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                        }}
                    >
                        {t('auth.create_account')}
                    </Link>
                </p>
            </form>
        </div>
    );
}
