import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { Envelope, Lock } from 'phosphor-react';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

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

    return (
        <div className={styles.container}>
            <form onSubmit={handleLogin} className={styles.formBox}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('auth.welcome_back')}</h1>
                    <p className={styles.subtitle}>{t('auth.login_subtitle')}</p>
                </div>

                <div className={styles.inputsContainer}>
                    {/* Email */}
                    <div className={styles.inputGroup}>
                        <Envelope size={20} className={styles.icon} />
                        <input
                            required
                            type="email"
                            placeholder={t('auth.email_label')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {/* Password */}
                    <div className={styles.inputGroup}>
                        <Lock size={20} className={styles.icon} />
                        <input
                            required
                            type="password"
                            placeholder={t('auth.password_label')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? t('common.loading') : t('auth.login_button')}
                </button>

                {/* Signup Link */}
                <p className={styles.signupText}>
                    {t('auth.no_account')}{' '}
                    <Link to="/signup" className={styles.link}>
                        {t('auth.create_account')}
                    </Link>
                </p>
            </form>
        </div>
    );
}